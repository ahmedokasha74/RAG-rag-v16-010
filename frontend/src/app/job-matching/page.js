"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  DollarSign,
  Briefcase,
  Target,
  ExternalLink,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function JobMatchingPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State (اختياري حالياً بدون backend filtering)
  const [filters, setFilters] = useState({
    industry: "Software Engineering",
    location: "Remote (Worldwide)",
    experienceLevels: [],
  });

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    const projectId = localStorage.getItem("project_id");
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/nlp/index/jops/${projectId}`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      // API شكلها:
      // { status, data: [...] }
      setJobs(data?.data || []);
    } catch (error) {
      console.error("Jobs fetch error:", error);
      setError(error.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleExpChange = (lvl) => {
    setFilters((prev) => ({
      ...prev,
      experienceLevels: prev.experienceLevels.includes(lvl)
        ? prev.experienceLevels.filter((l) => l !== lvl)
        : [...prev.experienceLevels, lvl],
    }));
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Job Matching Engine
        </h1>
        <p className="text-muted-foreground">
          AI-curated roles based on semantic similarity to your extracted skill
          vectors.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        {/* Filters */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="glass p-6 rounded-2xl sticky top-6">
            <h3 className="font-semibold text-lg mb-6 flex items-center text-foreground">
              <Search className="w-4 h-4 mr-2" /> Match Parameters
            </h3>

            <button
              onClick={loadJobs}
              className="w-full py-3 mt-4 border border-primary/40 text-primary bg-primary/5 rounded-lg text-sm font-semibold hover:bg-primary/20 transition-all"
            >
              Refresh Jobs
            </button>
          </div>
        </div>

        {/* Jobs */}
        <div className="flex-1 space-y-4 pb-10">
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <span className="text-primary animate-pulse">
                Loading jobs...
              </span>
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : jobs.length === 0 ? (
            <div className="text-muted-foreground">No jobs found</div>
          ) : (
            jobs.map((job, idx) => (
              <motion.div
                key={job.id || idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-6"
                whileHover={{
                  rotateX: 8,
                  rotateY: -8,
                  scale: 1.03,
                }}
                transition={{ type: "spring", stiffness: 200 }}
                style={{
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    {job.title}
                  </h2>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {job.company?.display_name || "Unknown"}
                    </span>

                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location?.display_name || "N/A"}
                    </span>

                    <span className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {job.salary_min
                        ? `${job.salary_min} - ${job.salary_max}`
                        : "N/A"}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {job.description}
                  </p>
                </div>

                <div className="md:w-40 flex items-center justify-center">
                  <a
                    href={job.redirect_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-primary text-black font-bold rounded-xl flex items-center justify-center hover:opacity-90"
                  >
                    Apply <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
