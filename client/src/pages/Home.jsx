
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const SOCIAL_LINKS = {
  github: "https://github.com/sivaraj-bit",
  linkedin: "https://www.linkedin.com/in/sivaraj33/",
};

function SocialLinks() {
  return (
    <div className="flex items-center gap-4">
      <a
        href={SOCIAL_LINKS.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn profile"
        className="social-icon"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM8.09 18.34H5.12V9.01h2.97v9.33ZM6.6 7.74a1.72 1.72 0 1 1 0-3.44 1.72 1.72 0 0 1 0 3.44Zm11.74 10.6h-2.97v-4.54c0-1.08-.02-2.47-1.51-2.47-1.51 0-1.74 1.18-1.74 2.39v4.62H9.15V9.01h2.85v1.28h.04c.4-.75 1.37-1.54 2.82-1.54 3.01 0 3.57 1.98 3.57 4.55v5.04Z" />
        </svg>
      </a>

      <a
        href={SOCIAL_LINKS.github}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub profile"
        className="social-icon"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.82c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.5-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.62 1.22 3.26.93.1-.72.4-1.22.71-1.5-2.5-.29-5.13-1.25-5.13-5.56 0-1.23.44-2.24 1.16-3.03-.12-.29-.5-1.43.11-2.98 0 0 .95-.3 3.08 1.16a10.7 10.7 0 0 1 5.6 0c2.13-1.45 3.08-1.16 3.08-1.16.61 1.55.23 2.69.11 2.98.72.79 1.16 1.8 1.16 3.03 0 4.32-2.63 5.27-5.14 5.55.4.35.75 1.03.75 2.08v3.11c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z" />
        </svg>
      </a>
    </div>
  );
}

function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch blogs
  useEffect(() => {
    const controller = new AbortController();

    const fetchBlogs = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/blogs`, {
          signal: controller.signal,
        });

        setBlogs(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (err) {
        if (err.code !== "ERR_CANCELED") {
          console.error("Error fetching blogs:", err);
          setError("Unable to load stories. Please try again later.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchBlogs();

    return () => controller.abort();
  }, []);

  // Dynamic categories
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        blogs.map((blog) => blog.category || "General")
      ),
    ];

    return ["All", ...uniqueCategories];
  }, [blogs]);

  // Filter and search blogs
  const filteredBlogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return blogs.filter((blog) => {
      const category = blog.category || "General";

      const matchesCategory =
        selectedCategory === "All" ||
        category === selectedCategory;

      const matchesSearch =
        !query ||
        blog.title?.toLowerCase().includes(query) ||
        blog.content?.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [blogs, selectedCategory, search]);

  const featuredBlog = blogs[0];

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#FAF7F4] text-[#29231F] overflow-x-hidden">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');

        .journal-page {
          font-family: 'DM Sans', sans-serif;
        }

        .journal-serif {
          font-family: 'Playfair Display', serif;
        }

        html {
          scroll-behavior: smooth;
          scroll-padding-top: 100px;
        }

        section[id] {
          scroll-margin-top: 100px;
        }

        .hero-title {
          letter-spacing: -0.055em;
        }

        .nav-link {
          position: relative;
          transition: color 0.25s ease;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -7px;
          width: 0;
          height: 1.5px;
          background: #B96F50;
          transition: width 0.3s ease;
        }

        .nav-link:hover {
          color: #B96F50;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .social-icon {
          color: #51463E;
          transition: color 0.25s ease, transform 0.25s ease;
        }

        .social-icon:hover {
          color: #B96F50;
          transform: translateY(-3px);
        }

        .story-card {
          transition: transform 0.35s ease;
        }

        .story-card:hover {
          transform: translateY(-5px);
        }

        .story-image {
          transition: transform 0.6s cubic-bezier(.2,.7,.2,1);
        }

        .story-card:hover .story-image {
          transform: scale(1.045);
        }

        .journal-enter {
          animation: journalEnter 0.8s ease both;
        }

        .journal-delay-1 {
          animation-delay: 0.12s;
        }

        .journal-delay-2 {
          animation-delay: 0.24s;
        }

        .journal-delay-3 {
          animation-delay: 0.36s;
        }

        @keyframes journalEnter {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .menu-panel {
          animation: menuEnter 0.25s ease both;
        }

        @keyframes menuEnter {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="journal-page">

        {/* FIXED NAVBAR */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF7F4]/95 backdrop-blur-md border-b border-[#E9DFD7]/80">
          <nav className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 h-[76px] flex items-center justify-between">

            <Link
              to="/"
              onClick={closeMenu}
              className="journal-serif text-xl sm:text-2xl font-bold tracking-tight"
            >
              The Journal<span className="text-[#B96F50]">.</span>
            </Link>

            {/* DESKTOP NAVIGATION */}
            <div className="hidden md:flex items-center gap-8 lg:gap-11 text-sm font-medium text-[#70675F]">
              <a href="#about" className="nav-link">
                About
              </a>

              <a href="#blog" className="nav-link">
                Blog
              </a>

              <a href="#work" className="nav-link">
                Work
              </a>
            </div>

            {/* SOCIAL LINKS */}
            <div className="hidden md:block">
              <SocialLinks />
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="md:hidden w-10 h-10 flex items-center justify-center text-[#51463E]"
            >
              {menuOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
                  <path d="m18 6-12 12M6 6l12 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </nav>

          {/* MOBILE MENU */}
          {menuOpen && (
            <div className="menu-panel md:hidden bg-[#FAF7F4] border-t border-[#E9DFD7] px-6 py-6 shadow-lg">
              <div className="flex flex-col gap-5 text-sm font-medium text-[#70675F]">
                <a href="#about" onClick={closeMenu}>About</a>
                <a href="#blog" onClick={closeMenu}>Blog</a>
                <a href="#work" onClick={closeMenu}>Work</a>

                <div className="pt-4 border-t border-[#E9DFD7]">
                  <SocialLinks />
                </div>
              </div>
            </div>
          )}
        </header>

        {/* SPACE FOR FIXED NAVBAR */}
        <div className="h-[76px]" />

        {/* HERO */}
        <section
          id="about"
          className="max-w-5xl mx-auto px-6 pt-24 sm:pt-32 pb-24 sm:pb-32 text-center"
        >
          <p className="journal-enter text-xs sm:text-sm uppercase tracking-[0.28em] text-[#B96F50] font-semibold mb-7">
            Welcome to my corner of the internet
          </p>

          <h1 className="journal-serif hero-title text-[42px] sm:text-6xl lg:text-[76px] leading-[1.12] font-bold">
            <span className="block text-[#B96F50] journal-enter journal-delay-1">
              Building Ideas.
            </span>

            <span className="block text-[#29231F] journal-enter journal-delay-2">
              Writing Experiences.
            </span>

            <span className="block text-[#29231F] italic font-normal journal-enter journal-delay-3">
              Sharing Projects.
            </span>
          </h1>

          <p className="journal-enter journal-delay-3 max-w-3xl mx-auto mt-8 text-base sm:text-xl lg:text-[22px] leading-[1.8] text-[#766C64]">
            A space for exploring web development, documenting
            what I learn, sharing projects, and turning ideas
            into something real.
          </p>

          <a
            href="#blog"
            className="journal-enter inline-flex items-center gap-3 mt-9 bg-[#B96F50] text-white px-8 py-4 rounded-xl font-semibold shadow-[0_4px_0_#783F32] hover:bg-[#A85D42] hover:-translate-y-1 transition duration-300"
          >
            Explore my stories
            <span>↓</span>
          </a>
        </section>

        {/* DIVIDER */}
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14">
          <div className="border-t border-[#E9DFD7]" />
        </div>

        {/* FEATURED STORY */}
        {!loading && !error && featuredBlog && (
          <section className="max-w-6xl mx-auto px-6 sm:px-10 pt-20 pb-12">
            <div className="flex items-center justify-between mb-9">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#B96F50] mb-2">
                  A little introduction
                </p>

                <h2 className="journal-serif text-3xl sm:text-4xl text-[#29231F]">
                  Featured story
                </h2>
              </div>

              <span className="hidden sm:block text-xs tracking-widest text-[#998B80] uppercase">
                01 — Latest writing
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              {featuredBlog.image && (
                <Link
                  to={`/blog/${featuredBlog._id}`}
                  className="block overflow-hidden rounded-2xl bg-[#E9DFD7]"
                >
                  <img
                    src={featuredBlog.image}
                    alt={featuredBlog.title}
                    loading="lazy"
                    className="w-full h-[280px] sm:h-[390px] object-cover story-image"
                  />
                </Link>
              )}

              <div className="py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-[#B96F50] font-semibold mb-5">
                  {featuredBlog.category || "General"}
                </p>

                <Link to={`/blog/${featuredBlog._id}`}>
                  <h3 className="journal-serif text-3xl sm:text-4xl lg:text-5xl leading-tight text-[#29231F] hover:text-[#B96F50] transition">
                    {featuredBlog.title}
                  </h3>
                </Link>

                <p className="text-[#766C64] leading-8 mt-5 line-clamp-4">
                  {featuredBlog.content}
                </p>

                {featuredBlog.createdAt && (
                  <p className="text-xs text-[#998B80] mt-5">
                    {new Date(featuredBlog.createdAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-6 mt-7">
                  <Link
                    to={`/blog/${featuredBlog._id}`}
                    className="text-sm font-semibold text-[#B96F50] hover:text-[#783F32] transition"
                  >
                    Read the story ↗
                  </Link>

                  {featuredBlog.projectUrl && (
                    <a
                      href={featuredBlog.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-[#783F32] hover:text-[#B96F50] transition"
                    >
                      View Project ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* BLOG COLLECTION */}
        <section
          id="blog"
          className="max-w-6xl mx-auto px-6 sm:px-10 pt-16 pb-24"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#B96F50] mb-2">
                Notes, ideas & discoveries
              </p>

              <h2 className="journal-serif text-3xl sm:text-4xl text-[#29231F]">
                Latest stories
              </h2>
            </div>

            <p className="text-sm text-[#998B80]">
              {blogs.length} {blogs.length === 1 ? "story" : "stories"} published
            </p>
          </div>

          {/* SEARCH AND CATEGORY FILTER */}
          <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between mb-8">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`shrink-0 px-5 py-2.5 rounded-full text-sm transition duration-200 ${
                    selectedCategory === category
                      ? "bg-[#783F32] text-white"
                      : "bg-[#EFE7E0] text-[#74685E] hover:bg-[#E5D9CF]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stories..."
              aria-label="Search stories"
              className="w-full sm:w-64 border-b border-[#D9C9BE] bg-transparent py-3 text-sm outline-none placeholder:text-[#A99B90] focus:border-[#B96F50] transition"
            />
          </div>

          {/* BLOG STATES */}
          {loading ? (
            <div className="py-20 text-center text-[#766C64]">
              Gathering the stories...
            </div>
          ) : error ? (
            <div className="py-20 text-center text-red-600">
              {error}
            </div>
          ) : filteredBlogs.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-12">
              {filteredBlogs.map((blog) => (
                <article
                  key={blog._id}
                  className="story-card min-w-0"
                >
                  <Link
                    to={`/blog/${blog._id}`}
                    className="block"
                  >
                    {blog.image ? (
                      <div className="overflow-hidden rounded-xl bg-[#E9DFD7] mb-5">
                        <img
                          src={blog.image}
                          alt={blog.title}
                          loading="lazy"
                          className="story-image w-full h-60 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-60 rounded-xl bg-[#EFE7E0] mb-5 flex items-center justify-center">
                        <span className="journal-serif text-3xl text-[#B96F50]">
                          The Journal
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[11px] uppercase tracking-[0.16em] text-[#B96F50] font-semibold">
                        {blog.category || "General"}
                      </span>

                      {blog.createdAt && (
                        <>
                          <span className="text-[#C6B6A9]">·</span>
                          <span className="text-xs text-[#998B80]">
                            {new Date(blog.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="journal-serif text-2xl leading-snug text-[#29231F] hover:text-[#B96F50] transition">
                      {blog.title}
                    </h3>

                    <p className="text-sm text-[#766C64] leading-7 mt-3 line-clamp-3">
                      {blog.content}
                    </p>
                  </Link>

                  <div className="flex flex-wrap items-center gap-5 mt-5">
                    <Link
                      to={`/blog/${blog._id}`}
                      className="text-sm font-semibold text-[#B96F50] hover:text-[#783F32] transition"
                    >
                      Read article ↗
                    </Link>

                    {blog.projectUrl && (
                      <a
                        href={blog.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-[#783F32] hover:text-[#B96F50] transition"
                      >
                        View project ↗
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border-y border-[#E9DFD7]">
              <h3 className="journal-serif text-2xl text-[#29231F]">
                No stories found.
              </h3>

              <p className="text-sm text-[#998B80] mt-3">
                Try another category or search term.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                }}
                className="mt-5 text-sm text-[#B96F50] underline underline-offset-4"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* WORK SECTION */}
        <section
          id="work"
          className="bg-[#F0E6DE] border-y border-[#E5D8CE]"
        >
          <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20">
            <p className="text-xs uppercase tracking-[0.2em] text-[#B96F50] mb-3">
              Beyond the words
            </p>

            <h2 className="journal-serif text-3xl sm:text-4xl text-[#29231F]">
              Ideas brought to life.
            </h2>

            <p className="text-[#766C64] leading-8 max-w-2xl mt-5">
              Every project is an opportunity to learn, experiment,
              solve problems and build something useful. Explore
              the projects linked to my stories above.
            </p>

            <a
              href="#blog"
              className="inline-flex items-center gap-2 mt-7 text-sm font-semibold text-[#B96F50] hover:text-[#783F32] transition"
            >
              Explore projects ↗
            </a>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 py-9">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
            <Link
              to="/"
              className="journal-serif text-xl font-bold text-[#29231F]"
            >
              The Journal<span className="text-[#B96F50]">.</span>
            </Link>

            <p className="text-xs text-[#998B80]">
              © {new Date().getFullYear()} The Journal. Built with curiosity.
            </p>

            <SocialLinks />
          </div>
        </footer>

      </div>
    </div>
  );
}

export default Home;
