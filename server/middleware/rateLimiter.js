import ratelimit from "../config/upstash.js";

// GET/HEAD requests skip the Upstash round-trip entirely. They're the bulk
// of traffic (e.g. the dashboard alone fires ~9 parallel GETs on load) and
// read-only, so there's nothing to rate-limit-protect there - the app was
// paying a full extra network hop to Redis on every single read, on top of
// Render's own free-tier latency and Atlas's, which is a big chunk of why
// the app feels slow. Mutating requests still go through the limiter.
const rateLimiter = async (req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD") return next();

  try {
    const { success } = await ratelimit.limit("my-rate-limit");

    if (!success) {
      return res.status(429).json({
        message: "Too many requests, please try again later",
      });
    }

    next();
  } catch (error) {
    console.log("Rate limit error, failing open", error);
    next();
  }
};

export default rateLimiter;