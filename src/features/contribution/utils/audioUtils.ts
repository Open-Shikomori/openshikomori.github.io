export function bufferToWave(abuffer: AudioBuffer, offset: number, len: number) {
  const numOfChan = abuffer.numberOfChannels;
  const length = len * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];
  let i;
  let sample;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit (hardcoded)

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  // write interleaved data
  for (i = 0; i < numOfChan; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff; // scale to 16-bit signed int
      view.setInt16(pos, sample, true); // write 16-bit sample
      pos += 2;
    }
    offset++; // next source sample
  }

  // create Blob
  return new Blob([buffer], { type: "audio/wav" });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

/**
 * Detects the start and end of actual audio content in an AudioBuffer.
 * Removes leading and trailing silence/noise based on a threshold.
 */
export function getCleanAudioRange(buffer: AudioBuffer, threshold = 0.015) {
  const data = buffer.getChannelData(0); // Use first channel for detection
  let start = 0;
  let end = data.length - 1;

  // Find first sample above threshold
  while (start < data.length && Math.abs(data[start]) < threshold) {
    start++;
  }

  // Find last sample above threshold
  while (end > start && Math.abs(data[end]) < threshold) {
    end--;
  }

  // Add a small padding (approx 100ms) to avoid clipping speech
  const padding = Math.floor(buffer.sampleRate * 0.1);
  start = Math.max(0, start - padding);
  end = Math.min(data.length - 1, end + padding);

  const length = end - start;
  
  // Return null if the entire clip is essentially silent
  if (length < buffer.sampleRate * 0.2) { // Less than 200ms of content
    return null;
  }

  return { start, end, length };
}
