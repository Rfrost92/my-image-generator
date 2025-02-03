import { useEffect, useState } from "react";

export default function App() {
    const [prompt, setPrompt] = useState<string>("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [history, setHistory] = useState<{ url: string; filename: string }[]>([]);
    const [selectedImage, setSelectedImage] = useState<{ url: string; filename: string } | null>(null);

    // 🔹 Model selection (FLUX schnell & FLUX dev)
    const [selectedModel, setSelectedModel] = useState<string>("runware:100@1"); // Default: FLUX schnell
    const [selectedResolution, setSelectedResolution] = useState<{ width: number; height: number }>({ width: 512, height: 512 });

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch("http://localhost:5003/api/images");
                const data = await response.json();
                setHistory(data.images);
            } catch (error) {
                console.error("Error fetching history:", error);
            }
        };

        fetchHistory();
    }, []);

    const generateImage = async () => {
        if (!prompt) return;

        setLoading(true);
        setImageUrl(null);

        try {
            const response = await fetch("http://localhost:5003/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt,
                    model: selectedModel,
                    width: selectedResolution.width,
                    height: selectedResolution.height
                }),
            });

            const data = await response.json();
            if (data.imageUrl) {
                setImageUrl(data.imageUrl);
                setHistory((prev) => [{ url: data.imageUrl, filename: data.filename }, ...prev]); // Add new image
            } else {
                alert("Failed to generate image");
            }
        } catch (error) {
            console.error("Error generating image:", error);
            alert("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-screen flex bg-gray-100 p-8">
            {/* Left Section: Prompt Input */}
            <div className="w-1/3 bg-white shadow-lg rounded-lg p-6 flex flex-col">
                <h1 className="text-2xl font-bold mb-4">AI Image Generator</h1>
                <textarea
                    className="w-full p-2 border rounded-lg mb-4"
                    rows={3}
                    placeholder="Enter a prompt (e.g. 'A futuristic city at night')"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />

                {/* Model Selection Dropdown */}
                <label className="text-gray-700 font-semibold mt-2">Model</label>
                <select
                    className="w-full p-2 border rounded-lg mb-4"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                >
                    <option value="runware:100@1">FLUX schnell</option>
                    <option value="runware:101@1">FLUX dev</option>
                </select>

                {/* Resolution Selection Dropdown */}
                <label className="text-gray-700 font-semibold">Resolution</label>
                <select
                    className="w-full p-2 border rounded-lg mb-4"
                    value={`${selectedResolution.width}x${selectedResolution.height}`}
                    onChange={(e) => {
                        const [width, height] = e.target.value.split("x").map(Number);
                        setSelectedResolution({ width, height });
                    }}
                >
                    <option value="512x512">512x512 (default)</option>
                    <option value="1024x1024">1024x1024</option>
                    <option value="256x256">256x256</option>
                </select>

                <button
                    onClick={generateImage}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    disabled={loading}
                >
                    {loading ? "Generating..." : "Generate Image"}
                </button>
            </div>

            {/* Center Section: Latest Generated Image */}
            <div className="w-1/3 flex flex-col items-center justify-center p-6">
                <h2 className="text-xl font-semibold mb-2">Latest Generated Picture</h2>
                <div className="w-full h-[500px] flex items-center justify-center border rounded-lg bg-gray-200">
                    {loading ? (
                        <p className="text-gray-600">Loading...</p>
                    ) : imageUrl ? (
                        <img src={imageUrl} alt="Generated AI" className="rounded-lg max-h-[500px] w-auto" />
                    ) : (
                        <p className="text-gray-500">No image yet</p>
                    )}
                </div>
                <p className="text-sm text-gray-600 mt-2 italic">Prompt: {prompt || "N/A"}</p>
            </div>

            {/* Right Section: Previously Generated Images */}
            <div className="w-1/3 bg-white shadow-lg rounded-lg p-6 overflow-y-auto max-h-screen">
                <h2 className="text-xl font-semibold mb-4">Previously Generated</h2>
                <div className="grid grid-cols-3 gap-4">
                    {history.length > 0 ? (
                        history.map((img, index) => (
                            <img
                                key={index}
                                src={img.url}
                                alt={`Generated ${index}`}
                                className="rounded-lg w-full h-24 object-cover cursor-pointer hover:opacity-75 transition"
                                onClick={() => setSelectedImage(img)} // Open modal on click
                            />
                        ))
                    ) : (
                        <p className="text-gray-500">No previous images</p>
                    )}
                </div>
            </div>

            {/* Modal for Enlarged Image */}
            {selectedImage && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="bg-white rounded-lg p-4 max-w-xl w-full flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img src={selectedImage.url} alt="Enlarged" className="w-full max-h-[500px] rounded-lg" />
                        <p className="text-gray-600 mt-2">{selectedImage.filename}</p>
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
