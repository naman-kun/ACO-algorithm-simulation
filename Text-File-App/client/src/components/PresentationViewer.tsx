import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, FileText, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const SMA_SLIDES = [
    "/slides/sma/slide_1.png",
    "/slides/sma/slide_2.png",
    "/slides/sma/slide_3.png",
    "/slides/sma/slide_4.png",
    "/slides/sma/slide_5.png",
    "/slides/sma/slide_6.png",
    "/slides/sma/slide_7.png",
    "/slides/sma/slide_9.png",
    "/slides/sma/slide_8.png",
    "/slides/sma/slide_10.png",
    "/slides/sma/slide_14.png",
    "/slides/sma/slide_11.png",
    "/slides/sma/slide_13.png",
    "/slides/sma/slide_12.png"
];

const ACO_SLIDES: string[] = [
    "/slides/aco/slide_1.1.png",
    "/slides/aco/slide_1.2.png",
    "/slides/aco/slide_1.3.png",
    "/slides/aco/slide_1.4.png",
    "/slides/aco/slide_1.5.png",
    "/slides/aco/slide_1.6.png",
    "/slides/aco/slide_1.7.png",
    "/slides/aco/slide_1.8.png",
    "/slides/aco/slide_1.9.png",
    "/slides/aco/slide_1.10.png",
    "/slides/aco/slide_1.11.png",
    "/slides/aco/slide_1.12.png",
    "/slides/aco/slide_1.13.png",
    "/slides/aco/slide_1.14.png",
    "/slides/aco/slide_14.png"
];

interface SlideViewerProps {
    title: string;
    slides: string[];
    credits?: string;
}

function SlideViewer({ title, slides, credits }: SlideViewerProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const hasSlides = slides.length > 0;

    const nextSlide = () => {
        // Move to the next slide if available
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    // Preload images for smoother transitions
    useEffect(() => {
        if (!hasSlides) return;

        slides.forEach((slide) => {
            const img = new Image();
            img.src = slide;
        });
    }, [slides, hasSlides]);

    if (!hasSlides) {
        return (
            <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden mb-8">
                <div className="p-4 border-b border-white/10 bg-black/60">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-mono uppercase tracking-widest text-primary font-bold">
                            {title}
                            {credits && <span className="ml-2 text-muted-foreground normal-case tracking-normal">({credits})</span>}
                        </h3>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground p-8 text-center bg-black/20">
                    <ImageOff className="w-12 h-12 mb-4 opacity-30" />
                    <p className="text-sm font-mono opacity-60">No slides available for this presentation.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden mb-8 group">
            <div className="p-4 border-b border-white/10 bg-black/60 flex justify-between items-center">
                <h3 className="text-sm font-mono uppercase tracking-widest text-primary font-bold">
                    {title}
                    {credits && <span className="ml-2 text-muted-foreground normal-case tracking-normal">({credits})</span>}
                </h3>
                <span className="text-xs font-mono text-muted-foreground">
                    {currentSlide + 1} / {slides.length}
                </span>
            </div>

            <div className="relative w-full aspect-[16/9] bg-black/90 flex items-center justify-center overflow-hidden">
                {/* Slide Display */}
                <img
                    src={slides[currentSlide]}
                    alt={`${title} - Slide ${currentSlide + 1}`}
                    className="max-h-full max-w-full object-contain"
                />

                {/* Navigation Overlay */}
                <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                        className="pointer-events-auto h-12 w-12 rounded-full bg-black/40 hover:bg-primary/20 text-white/70 hover:text-primary backdrop-blur-md transition-all disabled:opacity-0 border border-white/5"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={nextSlide}
                        disabled={currentSlide === slides.length - 1}
                        className="pointer-events-auto h-12 w-12 rounded-full bg-black/40 hover:bg-primary/20 text-white/70 hover:text-primary backdrop-blur-md transition-all disabled:opacity-0 border border-white/5"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function PresentationViewer() {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 pb-12">
            <SlideViewer
                title="Ant Colony Optimization Algorithm Presentation"
                slides={ACO_SLIDES}
                credits="Credit: Tanish Shah and Naman Shah"
            />

            <SlideViewer
                title="Slime Mold Algorithm Presentation"
                slides={SMA_SLIDES}
                credits="Credit: Tanish Shah and Krish Mehta"
            />
        </div>
    );
}
