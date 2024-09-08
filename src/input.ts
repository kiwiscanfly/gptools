import fs from 'fs';
import path from 'path';
import pdf2md from '@opendocsg/pdf2md';
import { YoutubeTranscript } from 'youtube-transcript';

export function getInputFromStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
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
}

export async function getInputFromPdf(pdfOption: string): Promise<string> {
  const filePath = path.resolve(pdfOption);
  if (!fs.statSync(filePath).isFile()) {
    console.error(`${filePath} is not a file`);
    process.exit(1);
  }
  const pdfBuffer = fs.readFileSync(filePath);
  return pdf2md(pdfBuffer);
};

function isYouTubeUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return ['www.youtube.com', 'youtube.com', 'youtu.be'].includes(url.hostname);
  } catch (error) {
    console.error('Invalid URL:', error);
    return false;
  }
};

function extractVideoID(urlString: string): string | null {
  const url = new URL(urlString);
  if (url.hostname === 'youtu.be') {
    return url.pathname.slice(1);
  }
  if (url.hostname.includes('youtube.com')) {
    return url.searchParams.get('v');
  }
  throw new Error('Invalid YouTube URL');
};

export async function getInputFromPathOrUrl(pathOrUrl: string): Promise<string> {
  if (pathOrUrl.startsWith('http')) {
    if (isYouTubeUrl(pathOrUrl)) {
      const videoId = extractVideoID(pathOrUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      return transcript.map(item => item.text).join(' ');
    }
    const response = await fetch(pathOrUrl);
    return await response.text();
  }
  return fs.readFileSync(pathOrUrl, 'utf8');
};