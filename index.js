require("dotenv").config();
const express = require("express");
const connectToMongoDB = require("./connect");
const urlRoute = require("./routes/url");
const URL = require("./models/url");

const app = express();
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/short-url";

// Connect to MongoDB
connectToMongoDB(MONGO_URI);

// Parse JSON and form bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logger middleware (logs each Postman call to the terminal)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Root route - Interactive Postman API Guide
app.get("/", (req, res) => {
  const host = `${req.protocol}://${req.get("host")}`;
  return res.status(200).json({
    status: "online",
    name: "URL Shortener REST API",
    description: "Designed for Postman API testing",
    baseUrl: host,
    endpoints: [
      {
        method: "POST",
        path: "/url",
        description: "Create a new shortened URL (random or custom alias)",
        body: {
          url: "https://example.com",
          customAlias: "optional-custom-alias (optional)",
        },
        exampleUrl: `${host}/url`,
      },
      {
        method: "GET",
        path: "/url/all",
        description: "Fetch all shortened URLs with total click counts",
        exampleUrl: `${host}/url/all`,
      },
      {
        method: "GET",
        path: "/url/analytics/:shortId",
        description: "Fetch detailed click analytics (timestamps, IP, user-agent)",
        exampleUrl: `${host}/url/analytics/sampleId`,
      },
      {
        method: "DELETE",
        path: "/url/:shortId",
        description: "Delete a shortened URL by its shortId",
        exampleUrl: `${host}/url/sampleId`,
      },
      {
        method: "GET",
        path: "/:shortId",
        description: "Redirect to the original target URL",
        exampleUrl: `${host}/sampleId`,
      },
    ],
  });
});

// Mount URL Routes
app.use("/url", urlRoute);

// Redirect Handler: GET /:shortId
app.get("/:shortId", async (req, res) => {
  const { shortId } = req.params;

  try {
    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    const entry = await URL.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
            ip: clientIp,
            userAgent: userAgent,
          },
        },
      },
      { new: false }
    );

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: `Short URL '${shortId}' was not found.`,
      });
    }

    return res.redirect(entry.redirectURL);
  } catch (error) {
    console.error("Redirect error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

// 404 Handler for undefined routes
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    error: "Route Not Found",
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist. Visit GET / for API documentation.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  return res.status(err.status || 500).json({
    success: false,
    error: "Server Error",
    message: err.message || "Something went wrong on the server.",
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📋 Postman API Guide: GET http://localhost:${PORT}/\n`);
});
