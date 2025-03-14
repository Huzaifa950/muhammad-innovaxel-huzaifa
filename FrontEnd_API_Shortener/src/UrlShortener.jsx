import React, { useState } from "react";
import axios from "axios";

const UrlShortener = () => {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shortId, setShortId] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [newLongUrl, setNewLongUrl] = useState('');
  const [message, setMessage] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');

  const handleShorten = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL.");
      return;
    }

    setLoading(true);
    setError("");
    setStats(null);

    try {
      const response = await axios.post("http://localhost:5000/shorten", { longUrl: url });
      setShortId(response.data.shortId);

      if (!response.data.shortId) {
        throw new Error("Invalid response: shortId is missing");
      }

      setShortUrl(`http://localhost:5000/stats/${response.data.shortId}`);
    } catch (error) {
      setError("Failed to shorten URL. Please try again.");
      console.error("Error shortening URL:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleGetStats = async (shortId) => {
    try {
      console.log("Fetching stats for shortId:", shortId);
      const response = await axios.get(`http://localhost:5000/stats/${shortId}`);
      console.log("API Raw Response:", response);

      if (response.data) {
        console.log("API Data:", response.data);
        setStats(response.data);
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };


  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    alert("Short URL copied to clipboard!");
  };


  const handleRetrieveOriginalUrl = async () => {
    if (!shortId.trim()) {
      setError("Please enter a short ID.");
      return;
    }
    setError("");

    try {
      const response = await axios.get(`http://localhost:5000/shorten/${shortId}`);

      if (response.data.url) {
        setError("");
        setOriginalUrl(response.data.url);
        window.open(response.data.url, "_blank");
      } else {
        setError("Shortened URL not found.");
      }
    } catch (error) {
      setError("Error retrieving original URL.");
      console.error("Error retrieving original URL:", error);
    }
  };

  return (

    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: "400px", margin: "auto", textAlign: "center", fontFamily: "Arial, sans-serif" }}>
        <h3>URL Shortener</h3>

        <input
          type="text"
          placeholder="Enter full URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <button onClick={handleShorten} disabled={loading} style={{ padding: "8px 12px", marginBottom: "10px" }}>
          {loading ? "Shortening..." : "Shorten"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {shortUrl && (
          <div>
            <p>
              Shortened URL: <a href={shortUrl} target="_blank" rel="noopener noreferrer">{shortUrl}</a>
            </p>
            <button onClick={handleCopy} style={{ marginRight: "10px" }}>Copy URL</button>
            <button onClick={() => handleGetStats(shortId)}>Get Stats</button>
          </div>
        )}

        {stats ? (
          <div>
            <h3>Stats for {stats.shortId}</h3>
            <p><strong>Long URL:</strong> <a href={stats.longUrl} target="_blank" rel="noopener noreferrer">{stats.longUrl}</a></p>
            <p><strong>Visits:</strong> {stats.visits}</p>
            <p><strong>Created At:</strong> {new Date(stats.createdAt).toLocaleString()}</p>
          </div>
        ) : (
          <p>No stats available. Click "Get Stats" to fetch.</p>
        )}
      </div>

      <div style={{ maxWidth: "400px", margin: "auto", textAlign: "center", fontFamily: "Arial, sans-serif" }}>
      <div style={{ marginTop: "40px" }}>
        <h3>Retrieve Original URL</h3>
        <div>
          <input type="text" style={{ width: "100%", padding: "8px", marginBottom: "10px" }} placeholder="Enter Short ID" value={shortId} onChange={(e) => setShortId(e.target.value)} />
        </div>
        <button onClick={handleRetrieveOriginalUrl} style={{ padding: "8px 12px", marginBottom: "10px" }}>Retrieve & Redirect</button>
        {originalUrl && <p style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>Original URL = <a href={originalUrl} target="_blank">{originalUrl}</a></p>}
        </div>
      </div>

    </div>


  );
};

export default UrlShortener;
