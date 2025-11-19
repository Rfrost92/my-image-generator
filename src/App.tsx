import { useEffect, useState } from "react";

type HistoryItem = {
    url: string;
    filename?: string;
    publicId?: string;
};

export default function App() {
    const [prompt, setPrompt] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [selectedImage, setSelectedImage] = useState<HistoryItem | null>(null);

    const [selectedModel, setSelectedModel] = useState("runware:100@1"); // FLUX schnell
    const [selectedResolution, setSelectedResolution] = useState<{ width: number; height: number }>({
        width: 512,
        height: 512,
    });

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch("http://localhost:5003/api/images");
                const data = await response.json();
                setHistory(data.images || []);
            } catch (error) {
                console.error("Error fetching history:", error);
            }
        };

        fetchHistory();
    }, []);

    const generateImage = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setImageUrl(null);

        try {
            const response = await fetch("http://localhost:5003/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    model: selectedModel,
                    width: selectedResolution.width,
                    height: selectedResolution.height,
                }),
            });

            const data = await response.json();
            if (data.imageUrl) {
                const newItem: HistoryItem = {
                    url: data.imageUrl,
                    filename: data.filename,
                };
                setImageUrl(data.imageUrl);
                setHistory((prev) => [newItem, ...prev]);
            } else {
                alert("Failed to generate image");
            }
        } catch (error) {
            console.error("Error generating image:", error);
            alert("Something went wrong while generating the image.");
        } finally {
            setLoading(false);
        }
    };

    const charsCount = prompt.length;
    const promptInfo =
        charsCount === 0 ? "No prompt yet" : `${charsCount.toLocaleString()} characters`;

    return (
        <div className="min-h-screen bg-slate-100">
            {/* subtle background gradient */}
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_#38bdf833,_transparent_55%),radial-gradient(circle_at_bottom_right,_#f9731633,_transparent_55%)]" />

            <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-8 pt-6 md:px-8 md:pt-10">
                {/* Top bar */}
                <header className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                            Flux Studio
                        </h1>
                        <p className="mt-2 max-w-xl text-sm text-slate-600 md:text-[15px]">
                            Generate images with FLUX models, store them in Cloudinary and browse your own
                            mini gallery. Perfect as an AI portfolio project.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-slate-600 shadow-sm backdrop-blur">
              <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Runware · FLUX
            </span>
                        <span className="inline-flex items-center rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-slate-600 shadow-sm backdrop-blur">
              Cloudinary storage
            </span>
                        <span className="inline-flex items-center rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-slate-600 shadow-sm backdrop-blur">
              React · Vite · Tailwind
            </span>
                    </div>
                </header>

                {/* Main content */}
                <div className="grid flex-1 gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
                    {/* Left: Controls */}
                    <section className="flex flex-col rounded-2xl bg-white/90 p-5 shadow-lg shadow-slate-300/40 backdrop-blur">
                        <div className="mb-4 flex items-center justify-between gap-2">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-900 md:text-base">
                                    Prompt & Settings
                                </h2>
                                <p className="text-xs text-slate-500 md:text-[13px]">
                                    Describe what you want to see. Try being specific about style, lighting and mood.
                                </p>
                            </div>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-500">
                {promptInfo}
              </span>
                        </div>

                        <div className="flex flex-1 flex-col gap-4">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-700">
                                    Prompt
                                </label>
                                <textarea
                                    className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-amber-400/30 transition focus:border-amber-400 focus:ring-2"
                                    placeholder={`e.g. "A cozy coffee shop interior, warm lighting, shallow depth of field, 35mm film look"`}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-700">
                                        Model
                                    </label>
                                    <select
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-amber-400/30 transition focus:border-amber-400 focus:ring-2"
                                        value={selectedModel}
                                        onChange={(e) => setSelectedModel(e.target.value)}
                                    >
                                        <option value="runware:100@1">FLUX schnell</option>
                                        <option value="runware:101@1">FLUX dev</option>
                                    </select>
                                    <p className="mt-1 text-[11px] text-slate-500">
                                        schnell → faster. dev → higher quality, a bit slower.
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-700">
                                        Resolution
                                    </label>
                                    <select
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-amber-400/30 transition focus:border-amber-400 focus:ring-2"
                                        value={`${selectedResolution.width}x${selectedResolution.height}`}
                                        onChange={(e) => {
                                            const [width, height] = e.target.value.split("x").map(Number);
                                            setSelectedResolution({ width, height });
                                        }}
                                    >
                                        <option value="512x512">512 × 512 (square)</option>
                                        <option value="1024x1024">1024 × 1024</option>
                                        <option value="768x1024">768 × 1024 (portrait)</option>
                                        <option value="1024x768">1024 × 768 (landscape)</option>
                                    </select>
                                    <p className="mt-1 text-[11px] text-slate-500">
                                        Higher resolutions look better but use more credits.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={generateImage}
                                disabled={loading}
                                className="mt-auto inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-md shadow-amber-300/40 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Generating…" : "Generate image"}
                            </button>

                            <p className="text-[11px] text-slate-500">
                                Images are generated via Runware and stored in a{" "}
                                <span className="font-medium">Cloudinary</span> folder. This is a local demo –
                                nothing is publicly shared.
                            </p>
                        </div>
                    </section>

                    {/* Right: Preview + History */}
                    <section className="flex flex-col gap-4">
                        {/* Preview card */}
                        <div className="flex flex-1 flex-col rounded-2xl bg-white/90 p-5 shadow-lg shadow-slate-300/40 backdrop-blur">
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900 md:text-base">
                                        Latest image
                                    </h2>
                                    <p className="text-xs text-slate-500 md:text-[13px]">
                                        Your newest generation appears here. Click to open it in a lightbox.
                                    </p>
                                </div>
                                {loading && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[11px] text-amber-700">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                    Generating…
                  </span>
                                )}
                            </div>

                            <button
                                type="button"
                                disabled={!imageUrl}
                                onClick={() =>
                                    imageUrl && setSelectedImage({ url: imageUrl })
                                }
                                className="group relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 outline-none transition hover:border-amber-400 disabled:cursor-default disabled:hover:border-slate-200"
                            >
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt="Generated AI"
                                        className="max-h-[420px] w-full object-contain transition group-hover:scale-[1.01]"
                                    />
                                ) : (
                                    <span className="text-xs text-slate-500">
                    No image yet. Generate something on the left.
                  </span>
                                )}
                            </button>

                            <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
                                <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    Prompt used
                                </div>
                                <div className="text-[12px] leading-relaxed text-slate-800">
                                    {prompt || "Type a prompt to generate your first image."}
                                </div>
                            </div>
                        </div>

                        {/* History strip */}
                        <div className="rounded-2xl bg-white/90 p-4 shadow-lg shadow-slate-300/40 backdrop-blur">
                            <div className="mb-2 flex items-center justify-between gap-2">
                                <h3 className="text-sm font-semibold text-slate-900 md:text-[15px]">
                                    Recent images
                                </h3>
                                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-500">
                  {history.length} stored
                </span>
                            </div>
                            {history.length === 0 ? (
                                <p className="text-xs text-slate-500">
                                    When you generate images, they will appear here as a horizontal gallery.
                                </p>
                            ) : (
                                <div className="flex gap-3 overflow-x-auto pb-1 pt-1">
                                    {history.map((img, index) => (
                                        <button
                                            key={`${img.url}-${index}`}
                                            type="button"
                                            className="relative h-20 min-w-[80px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50 outline-none transition hover:border-amber-400"
                                            onClick={() => setSelectedImage(img)}
                                        >
                                            <img
                                                src={img.url}
                                                alt={`Generated ${index}`}
                                                className="h-full w-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <footer className="mt-6 text-[11px] text-slate-500">
                    Flux Studio · AI image generator using Runware, Cloudinary and React. Built as a demo
                    project for an AI developer portfolio.
                </footer>
            </div>

            {/* Modal / Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="max-h-[90vh] w-full max-w-4xl rounded-2xl bg-white p-4 shadow-2xl shadow-black/40"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    Image preview
                                </div>
                                {selectedImage.filename && (
                                    <div className="text-xs text-slate-600">{selectedImage.filename}</div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedImage(null)}
                                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 hover:border-amber-400 hover:text-amber-700"
                            >
                                Close
                            </button>
                        </div>

                        <div className="max-h-[75vh] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                            <img
                                src={selectedImage.url}
                                alt="Enlarged"
                                className="h-full w-full max-h-[75vh] object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
