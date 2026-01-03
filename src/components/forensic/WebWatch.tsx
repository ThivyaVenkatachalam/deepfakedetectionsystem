import { useState } from "react";
import { Globe, AlertTriangle, CheckCircle, Clock, Shield, ExternalLink, Search, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";

// URL validation schema using zod
const urlSchema = z.string()
  .trim()
  .min(1, "URL cannot be empty")
  .max(2048, "URL is too long")
  .refine((val) => {
    // Add protocol if missing for validation
    const urlToValidate = val.startsWith('http') ? val : `https://${val}`;
    try {
      const parsed = new URL(urlToValidate);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return false;
      }
      // Validate hostname format (no empty or invalid hostnames)
      if (!parsed.hostname || parsed.hostname.length === 0) {
        return false;
      }
      // Block localhost and private IPs for security
      const hostname = parsed.hostname.toLowerCase();
      if (hostname === 'localhost' || 
          hostname.startsWith('127.') || 
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.startsWith('172.16.')) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }, "Please enter a valid URL or domain name");

// Safely extract and sanitize domain from URL
const extractDomain = (url: string): string => {
  const urlToValidate = url.startsWith('http') ? url : `https://${url}`;
  const parsed = new URL(urlToValidate);
  // Sanitize hostname - remove any potential injection characters
  return parsed.hostname.toLowerCase().replace(/[^a-z0-9.-]/g, '');
};

interface UrlAnalysisResult {
  url: string;
  domain: string;
  domainAge: number; // days
  registrar: string;
  createdDate: string;
  expiresDate: string;
  isSecure: boolean;
  verdict: 'safe' | 'suspicious' | 'danger';
  riskScore: number;
  warnings: string[];
  whoisData: {
    registrant?: string;
    country?: string;
    nameServers: string[];
  };
}

export function WebWatch() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<UrlAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeUrl = async () => {
    if (!url.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    // Validate URL using zod schema
    const validation = urlSchema.safeParse(url);
    if (!validation.success) {
      setError(validation.error.errors[0]?.message || "Invalid URL format");
      setIsAnalyzing(false);
      return;
    }

    // Simulate API call - in production, this would call a backend with python-whois
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Extract sanitized domain from validated URL
      const domain = extractDomain(url);

      // Simulated analysis - in production would use real WHOIS data
      const isNewDomain = Math.random() > 0.6;
      const hasSSL = url.startsWith('https') || Math.random() > 0.3;
      const domainAge = isNewDomain ? Math.floor(Math.random() * 30) : Math.floor(Math.random() * 3650);
      
      const warnings: string[] = [];
      let riskScore = 0;

      if (domainAge < 30) {
        warnings.push("Domain registered less than 30 days ago - common for scam sites");
        riskScore += 40;
      } else if (domainAge < 90) {
        warnings.push("Domain is relatively new (less than 90 days)");
        riskScore += 20;
      }

      if (!hasSSL) {
        warnings.push("No HTTPS encryption detected - data may not be secure");
        riskScore += 25;
      }

      if (domain.includes('-') && domain.split('-').length > 2) {
        warnings.push("Domain contains multiple hyphens - often used in phishing URLs");
        riskScore += 15;
      }

      if (/\d{4,}/.test(domain)) {
        warnings.push("Domain contains long number sequences - suspicious pattern");
        riskScore += 20;
      }

      const now = new Date();
      const createdDate = new Date(now.getTime() - domainAge * 24 * 60 * 60 * 1000);
      const expiresDate = new Date(createdDate.getTime() + 365 * 24 * 60 * 60 * 1000);

      const verdict: 'safe' | 'suspicious' | 'danger' = 
        riskScore >= 50 ? 'danger' : riskScore >= 25 ? 'suspicious' : 'safe';

      setResult({
        url,
        domain,
        domainAge,
        registrar: "Example Registrar Inc.",
        createdDate: createdDate.toISOString().split('T')[0],
        expiresDate: expiresDate.toISOString().split('T')[0],
        isSecure: hasSSL,
        verdict,
        riskScore,
        warnings,
        whoisData: {
          registrant: "REDACTED FOR PRIVACY",
          country: "US",
          nameServers: ["ns1.example.com", "ns2.example.com"],
        },
      });
    } catch (err) {
      setError("Failed to analyze URL. Please check the format and try again.");
    }

    setIsAnalyzing(false);
  };

  const getVerdictStyles = () => {
    if (!result) return "";
    switch (result.verdict) {
      case 'safe': return 'verdict-safe';
      case 'suspicious': return 'verdict-warning';
      case 'danger': return 'verdict-danger';
    }
  };

  const getVerdictIcon = () => {
    if (!result) return null;
    switch (result.verdict) {
      case 'safe': return <CheckCircle className="w-8 h-8" />;
      case 'suspicious': return <AlertTriangle className="w-8 h-8" />;
      case 'danger': return <XCircle className="w-8 h-8" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* URL Input */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Web Watch URL Analyzer</h2>
            <p className="text-sm text-muted-foreground">Check domains for scam indicators using WHOIS data</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="Enter URL or domain (e.g., example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && analyzeUrl()}
            className="flex-1 bg-muted/50 border-border"
          />
          <Button 
            onClick={analyzeUrl} 
            disabled={isAnalyzing || !url.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                Analyzing
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-destructive">{error}</p>
        )}
      </div>

      {/* Analysis Result */}
      {result && (
        <div className="space-y-6 animate-slide-up">
          {/* Verdict Card */}
          <div className={`glass-panel p-6 border-2 ${getVerdictStyles()}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getVerdictIcon()}
                <div>
                  <h3 className="text-xl font-bold capitalize">{result.verdict}</h3>
                  <p className="text-sm opacity-80">Risk Score: {result.riskScore}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono">{result.domain}</p>
                <div className="flex items-center gap-2 mt-1">
                  {result.isSecure ? (
                    <span className="text-xs text-success flex items-center gap-1">
                      <Shield className="w-3 h-3" /> HTTPS
                    </span>
                  ) : (
                    <span className="text-xs text-destructive flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> No HTTPS
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Domain Info */}
            <div className="glass-panel p-5">
              <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Domain Information
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Domain Age</span>
                  <span className={`text-sm font-mono ${result.domainAge < 30 ? 'text-destructive' : result.domainAge < 90 ? 'text-warning' : 'text-success'}`}>
                    {result.domainAge} days
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm font-mono text-foreground">{result.createdDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Expires</span>
                  <span className="text-sm font-mono text-foreground">{result.expiresDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Registrar</span>
                  <span className="text-sm font-mono text-foreground truncate max-w-[150px]">{result.registrar}</span>
                </div>
              </div>
            </div>

            {/* WHOIS Data */}
            <div className="glass-panel p-5">
              <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-primary" />
                WHOIS Data
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Registrant</span>
                  <span className="text-sm font-mono text-foreground">{result.whoisData.registrant}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Country</span>
                  <span className="text-sm font-mono text-foreground">{result.whoisData.country}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block mb-2">Name Servers</span>
                  <div className="space-y-1">
                    {result.whoisData.nameServers.map((ns, i) => (
                      <span key={i} className="text-xs font-mono text-foreground/70 block">{ns}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="glass-panel p-5">
              <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                Risk Indicators ({result.warnings.length})
              </h4>
              <div className="space-y-2">
                {result.warnings.map((warning, i) => (
                  <div 
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/30"
                  >
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
