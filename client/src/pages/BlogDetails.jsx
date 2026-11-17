
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function BlogDetails() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/blogs/${id}`
        );
        setBlog(response.data);
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF3EA] flex items-center justify-center">
        <p className="text-[#783F32] tracking-wide">
          Preparing the story...
        </p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#FAF3EA] flex flex-col items-center justify-center px-6">
        <h1 className="text-3xl font-serif text-[#783F32]">
          Story not found
        </h1>
        <Link to="/" className="mt-5 text-[#B96F50] underline">
          Return home
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF3EA] text-[#34251F]">
      {/* Navigation */}
      <nav className="max-w-6xl mx-auto px-6 md:px-10 py-7 flex justify-between items-center border-b border-[#E6B99F]/60">
        <Link
          to="/"
          className="text-xl font-serif font-semibold text-[#783F32]"
        >
          The Journal<span className="text-[#B96F50]">.</span>
        </Link>

        <Link
          to="/"
          className="text-sm text-[#783F32] hover:text-[#B96F50] transition"
        >
          ← All stories
        </Link>
      </nav>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-20">
        <header className="max-w-3xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-[#B96F50] font-semibold mb-6">
            {blog.category || "Journal"}
          </p>

          <h1 className="font-serif text-4xl md:text-6xl leading-[1.12] text-[#783F32] mb-8">
            {blog.title}
          </h1>

          <div className="w-16 h-[2px] bg-[#B96F50]" />
        </header>

        {/* Cover Image */}
        {blog.image && (
          <div className="mb-14">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full max-h-[560px] object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="max-w-3xl mx-auto">
          <div className="text-[17px] md:text-lg text-[#51423A] leading-[2] whitespace-pre-line">
            {blog.content}
          </div>

          {/* Project Link */}
          {blog.projectUrl && (
            <div className="mt-14 pt-8 border-t border-[#E6B99F]">
              <p className="text-xs uppercase tracking-[0.2em] text-[#B96F50] mb-4">
                Explore the project
              </p>

              <a
                href={blog.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#783F32] text-[#FAF3EA] px-7 py-4 hover:bg-[#B96F50] transition-colors duration-300"
              >
                View Live Project
                <span className="text-lg">↗</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="max-w-3xl mx-auto mt-20 pt-8 border-t border-[#E6B99F] flex justify-between items-center">
          <p className="font-serif italic text-[#783F32]">
            Thanks for reading.
          </p>

          <Link
            to="/"
            className="text-sm text-[#B96F50] hover:text-[#783F32] transition"
          >
            Back to journal ↑
          </Link>
        </footer>
      </article>
    </main>
  );
}

export default BlogDetails;
