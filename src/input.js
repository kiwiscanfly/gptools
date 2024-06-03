const fs = require('fs');
const path = require('path');
const pdf2md = require('@opendocsg/pdf2md');
const { YoutubeTranscript } = require('youtube-transcript');

module.exports.getInputFromStdin = () => new Promise((resolve, reject) => {
  let inputData = '';
  process.stdin.resume();

  process.stdin.on('data', (data) => {
    inputData += data;
  });

  process.stdin.on('end', () => {
    resolve(inputData);
  });

  process.stdin.on('error', (err) => {
    reject(err);
  });
});

const getInputFromPdf = async (pdfOption) => {
  const filePath = path.resolve(pdfOption);
  if (!fs.statSync(filePath).isFile()) {
    console.error(`${filePath} is not a file`);
    process.exit(1);
  }
  const pdfBuffer = fs.readFileSync(filePath);
  return pdf2md(pdfBuffer);
};

module.exports.getInputFromPdf = getInputFromPdf;

const isYouTubeUrl = (urlString) => {
  try {
    const url = new URL(urlString);
    return ['www.youtube.com', 'youtube.com', 'youtu.be'].includes(url.hostname);
  } catch (error) {
    console.error('Invalid URL:', error);
    return false;
  }
};

const extractVideoID = (urlString) => {
  const url = new URL(urlString);
  if (url.hostname === 'youtu.be') {
    return url.pathname.slice(1);
  }
  if (url.hostname.includes('youtube.com')) {
    return url.searchParams.get('v');
  }
  throw new Error('Invalid YouTube URL');
};

module.exports.getInputFromPathOrUrl = async (pathOrUrl) => {
  if (pathOrUrl.startsWith('http')) {
    if (isYouTubeUrl(pathOrUrl)) {
      const videoId = extractVideoID(pathOrUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      return transcript.map((item) => item.text).join(' ');
    }
    // TODO: Add support for other URL types
    throw new Error('Invalid input');
  }
  if (pathOrUrl.endsWith('.pdf')) {
    return getInputFromPdf(pathOrUrl);
  }
  // TODO: Add support for other file types
  throw new Error('Invalid input');
};
