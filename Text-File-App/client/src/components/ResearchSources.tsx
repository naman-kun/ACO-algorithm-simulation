import { ExternalLink, BookOpen, ScrollText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// USER INSTRUCTION: Add your research sources here.
// You can categorize them by type (e.g., "Core Research", "Papers", "Articles").
interface ResearchItem {
    title: string;
    authors: string;
    publication?: string;
    description: string;
    url?: string;
}

// TODO: Populate this array with your research papers and sources.
const RESEARCH_SOURCES: ResearchItem[] = [
    // Example Format (Uncomment and edit to add):
    /*
    {
      title: "Example Research Paper Title",
      authors: "Author Name, Co-Author Name",
      publication: "Journal of Computer Science (2024)",
      description: "Brief summary of the paper and its relevance to the project...",
      url: "https://example.com/paper-link"
    },
    */
];

export function ResearchSources() {
    const hasSources = RESEARCH_SOURCES.length > 0;

    if (!hasSources) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/10 rounded-lg bg-black/20">
                <ScrollText className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Research Library</h3>
                <p className="text-muted-foreground max-w-md">
                    No research sources have been added yet.
                </p>
                <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded text-left text-sm text-muted-foreground">
                    <p className="font-bold text-primary mb-2">How to add sources:</p>
                    <p>
                        Open <code>client/src/components/ResearchSources.tsx</code> and add entries to the <code>RESEARCH_SOURCES</code> array.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 p-6">
            <Card className="bg-black/40 border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                        <BookOpen className="w-5 h-5" />
                        Bibliography & References
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {RESEARCH_SOURCES.map((source, index) => (
                        <div key={index} className="group p-4 rounded-lg bg-white/5 border border-white/5 hover:border-primary/30 transition-all">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                                        {source.title}
                                    </h4>
                                    <div className="text-sm text-primary/80 font-mono mt-1">
                                        {source.authors} {source.publication && <span className="text-muted-foreground">| {source.publication}</span>}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                                        {source.description}
                                    </p>
                                </div>
                                {source.url && (
                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
