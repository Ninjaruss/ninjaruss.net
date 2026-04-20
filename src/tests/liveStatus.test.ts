import { describe, it, expect } from 'vitest';
import { parseYouTubeLiveResponse } from '../utils/liveStatus';

describe('parseYouTubeLiveResponse', () => {
  it('returns offline when items array is empty', () => {
    expect(parseYouTubeLiveResponse({ items: [] })).toEqual({ isLive: false, videoId: null });
  });

  it('returns live with videoId when items has entries', () => {
    const data = { items: [{ id: { videoId: 'abc123' } }] };
    expect(parseYouTubeLiveResponse(data)).toEqual({ isLive: true, videoId: 'abc123' });
  });

  it('returns offline for null input', () => {
    expect(parseYouTubeLiveResponse(null)).toEqual({ isLive: false, videoId: null });
  });

  it('returns offline for non-object input', () => {
    expect(parseYouTubeLiveResponse('bad')).toEqual({ isLive: false, videoId: null });
  });

  it('returns offline when items key is missing', () => {
    expect(parseYouTubeLiveResponse({})).toEqual({ isLive: false, videoId: null });
  });

  it('returns isLive true with null videoId when videoId field is missing', () => {
    const data = { items: [{ id: {} }] };
    expect(parseYouTubeLiveResponse(data)).toEqual({ isLive: true, videoId: null });
  });
});
