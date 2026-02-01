import { ExternalLink, BookOpen, ScrollText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResearchCategory {
    categoryName: string;
    sources: ResearchItem[];
}

interface ResearchItem {
    title: string;
    url?: string;
    citation?: string;
}

const RESEARCH_DATA: ResearchCategory[] = [
    {
        categoryName: "Slime Mold Algorithm Sources",
        sources: [
            {
                title: "ScienceDirect: Slime Mold Algorithm",
                url: "https://www.sciencedirect.com/science/article/abs/pii/S0167739X19320941"
            },
            {
                title: "PMC: Slime Mold Algorithm Review",
                url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9838547/"
            },
            {
                title: "ResearchGate: Slime Molds",
                url: "https://www.researchgate.net/publication/333395590_Slime_Molds"
            },
            {
                title: "MDPI: Sustainability 2021",
                url: "https://www.mdpi.com/2071-1050/13/11/5831"
            },
            {
                title: "ResearchGate: Slime Molds (Duplicate Reference)",
                url: "https://www.researchgate.net/publication/333395590_Slime_Molds"
            },
            {
                title: "MDPI: Sustainability 2021 (Duplicate Reference)",
                url: "https://www.mdpi.com/2071-1050/13/11/5831"
            },
            {
                title: "Journal of Theoretical Biology: Slime Mold Networks",
                url: "https://doi.org/10.1016/j.jtbi.2006.07.015"
            },
            {
                title: "MDPI: Biomimetics 2024",
                url: "https://www.mdpi.com/2313-7673/9/1/31"
            },
            {
                title: "Science: Rules of Biologically Inspired Adaptive Network Design",
                url: "https://www.science.org/doi/10.1126/science.1177894"
            }
        ]
    },
    {
        categoryName: "Ant Colony Optimization Algorithm Sources",
        sources: [
            {
                title: "CSA: Ant Colony Optimization Variants",
                url: "https://doi.org/10.1016/j.csa.2023.100031"
            },
            {
                title: "Hölldobler, Bert, and Edward Osborne Wilson. The Ants.",
                citation: "Cambridge, Belknap Press Of Harvard University Press, 1990."
            },
            {
                title: "Camazine, Scott, and et al. Self-Organization in Biological Systems.",
                citation: "Princeton, Princeton University Press, 2003."
            },
            {
                title: "IEEE: ITNG 2011",
                url: "https://doi.org/10.1109/ITNG.2011.159"
            },
            {
                title: "Atlantis Press Article",
                url: "https://www.atlantis-press.com/article/55917199.pdf"
            },
            {
                title: "ResearchGate: Slime Mould Algorithm Comprehensive Review",
                url: "https://www.researchgate.net/publication/366357595_Slime_mould_algorithm_a_comprehensive_review_of_recent_variants_and_application"
            }
        ]
    }
];

export function ResearchSources() {
    return (
        <div className="grid grid-cols-1 gap-8 p-8 max-w-5xl mx-auto">
            {RESEARCH_DATA.map((category, catIndex) => (
                <Card key={catIndex} className="bg-black/40 border-secondary/20 backdrop-blur-sm">
                    <CardHeader className="pb-3 border-b border-white/5">
                        <CardTitle className="flex items-center gap-3 text-secondary text-xl tracking-wide">
                            <BookOpen className="w-5 h-5 text-secondary/80" />
                            {category.categoryName}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-3">
                        {category.sources.map((source, index) => (
                            <div
                                key={index}
                                className="group flex items-start justify-between gap-4 p-4 rounded-lg bg-white/5 border border-white/5 hover:border-secondary/20 hover:bg-white/10 transition-all duration-300"
                            >
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-white group-hover:text-secondary transition-colors leading-relaxed">
                                        {source.title}
                                    </h4>
                                    {source.citation && (
                                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                                            {source.citation}
                                        </p>
                                    )}
                                </div>

                                {source.url && (
                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="shrink-0 p-2 rounded-full bg-black/20 text-muted-foreground hover:text-white hover:bg-secondary/20 transition-all"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}

            <div className="flex justify-center mt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-black/40 px-4 py-2 rounded-full border border-white/5">
                    <ScrollText className="w-3 h-3" />
                    <span>External links open in a new tab</span>
                </div>
            </div>
        </div>
    );
}
