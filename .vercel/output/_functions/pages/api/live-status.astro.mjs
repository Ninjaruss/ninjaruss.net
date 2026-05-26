export { renderers } from '../../renderers.mjs';

const prerender = false;
const GET = async () => {
  let twitchLive = false;
  let youtubeLive = false;
  const checks = [];
  await Promise.all(checks);
  const live = youtubeLive;
  return new Response(
    JSON.stringify({ live, twitch: twitchLive, youtube: youtubeLive }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
