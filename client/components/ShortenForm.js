import { useState } from "react";
import axios from "axios";
import { withPaymentInterceptor } from "x402-axios";
import { createWalletClient, custom } from "viem";
import { baseSepolia } from "viem/chains";

export default function ShortenWithPayment() {
  const [walletClient, setWalletClient] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [longUrl, setLongUrl] = useState("");
  const [status, setStatus] = useState("");
  const [shortLink, setShortLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      setStatus("Please install MetaMask.");
      return;
    }

    try {
      setStatus("Connecting wallet…");

      const [account] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const client = createWalletClient({
        account,
        chain: baseSepolia,
        transport: custom(window.ethereum),
      });
      const [address] = await client.getAddresses();

      setWalletClient(client);
      setWalletAddress(address);
      setStatus("Wallet connected!");
    } catch (err) {
      console.error(err);
      setStatus("Error connecting wallet: " + err.message);
    }
  };

  const handleDisconnect = () => {
    setWalletClient(null);
    setWalletAddress(null);
    setShortLink("");
    setStatus("Wallet disconnected.");
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(shortLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShorten = async () => {
    if (!longUrl) {
      setStatus("Enter a URL.");
      return;
    }

    if (!walletClient) {
      setStatus("Connect your wallet first.");
      return;
    }

    try {
      setStatus("Waiting for payment…");
      console.log(walletClient);

      // x402 axios client
      const client = withPaymentInterceptor(
        axios.create({ baseURL: process.env.NEXT_PUBLIC_SERVER_URL }),
        walletClient
      );

      const response = await client.post("/shorten", { longUrl });
      const path = response.data.shortUrl;
      setShortLink(`${path}`);
      setStatus("Short URL created!");
    } catch (err) {
      console.error(err);
      setStatus("Error: " + (err.response?.data?.error || err.message));
    }
  };

  if (!walletAddress) {
    return (
      <div style={{ maxWidth: 400, margin: "0 auto", padding: 24 }}>
        <button
          onClick={handleConnectWallet}
          style={{
            width: "100%",
            padding: 12,
            background: "black",
            color: "white",
            borderRadius: 8,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Connect Wallet
        </button>
        {status && <div style={{ marginTop: 16 }}>{status}</div>}
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#f5f5f5",
          padding: "4px 12px",
          borderRadius: 8,
          fontSize: 14,
        }}
      >
        <span>
          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </span>
        <button
          onClick={handleDisconnect}
          style={{
            padding: "2px 8px",
            fontSize: 12,
            cursor: "pointer",
            borderRadius: 4,
            border: "1px solid #ccc",
            background: "white",
          }}
        >
          Disconnect
        </button>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
        <h2>URL Shortener</h2>

        <input
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          placeholder="https://example.com/your-long-url"
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: 16,
            borderRadius: 8,
            border: "1px solid #ddd",
            marginBottom: 16,
          }}
        />

        <button
          onClick={handleShorten}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: "black",
            color: "white",
            borderRadius: 8,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Shorten URL
        </button>

        {status && <div style={{ marginTop: 16 }}>{status}</div>}

        {shortLink && (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              border: "1px solid #ccc",
              borderRadius: 8,
              background: "#fafafa",
            }}
          >
            <strong>Your short link:</strong>
            <div style={{ marginTop: 8 }}>
              <a href={shortLink} target="_blank" rel="noopener noreferrer">
                {shortLink}
              </a>
            </div>

            <button
              onClick={handleCopy}
              style={{
                marginTop: 12,
                padding: "8px 12px",
                background: copied ? "green" : "black",
                color: "white",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              {copied ? "Copied!" : "Copy to Clipboard"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
