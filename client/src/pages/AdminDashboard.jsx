
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

const API_URL = import.meta.env.VITE_API_URL;
const BLOGS_API_URL = `${API_URL}/api/blogs`;

const initialForm = {
  title: "",
  content: "",
  image: "",
  category: "Technology",
};

function AdminDashboard() {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");

  // Get a fresh Firebase ID token
  const getAuthConfig = async () => {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Please log in again.");
    }

    const token = await user.getIdToken();
    localStorage.setItem("adminToken", token);

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Check authentication and fetch blogs
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login", { replace: true });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const config = await getAuthConfig();
        const response = await axios.get(BLOGS_API_URL, config);
        const data = response.data;

        setBlogs(Array.isArray(data) ? data : data.blogs || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load blogs."
        );
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Search blogs
  const filteredBlogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return blogs;

    return blogs.filter((blog) =>
      blog.title?.toLowerCase().includes(query) ||
      blog.category?.toLowerCase().includes(query) ||
      blog.content?.toLowerCase().includes(query)
    );
  }, [blogs, search]);

  // Handle form inputs
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Open create form
  const openCreateForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Open edit form
  const handleEdit = (blog) => {
    setEditingId(blog._id);

    setForm({
      title: blog.title || "",
      content: blog.content || "",
      image: blog.image || "",
      category: blog.category || "Technology",
    });

    setError("");
    setSuccess("");
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Create or update blog
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const config = await getAuthConfig();

      if (editingId) {
        const response = await axios.put(
          `${BLOGS_API_URL}/${editingId}`,
          form,
          config
        );

        const updatedBlog = response.data.blog || response.data;

        setBlogs((prev) =>
          prev.map((blog) =>
            blog._id === editingId ? updatedBlog : blog
          )
        );

        setSuccess("Your story has been updated successfully.");
      } else {
        const response = await axios.post(
          BLOGS_API_URL,
          form,
          config
        );

        const newBlog = response.data.blog || response.data;

        setBlogs((prev) => [newBlog, ...prev]);
        setSuccess("Your story has been published successfully.");
      }

      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete blog
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this story? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const config = await getAuthConfig();

      await axios.delete(`${BLOGS_API_URL}/${id}`, config);

      setBlogs((prev) => prev.filter((blog) => blog._id !== id));
      setSuccess("Story deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to delete story."
      );
    }
  };

  // Firebase logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("adminToken");
      navigate("/admin/login", { replace: true });
    } catch (err) {
      setError("Unable to log out. Please try again.");
    }
  };

  // Close form
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#FAF3EA] text-[#3D302B]">
      <style>{`
        @keyframes appear {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .page-enter {
          animation: appear 0.5s ease both;
        }

        .story-enter {
          animation: appear 0.4s ease both;
        }

        .editor-input {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .editor-input:focus {
          border-color: #783F32;
          box-shadow: 0 0 0 3px rgba(120, 63, 50, 0.08);
          outline: none;
        }

        .story-row {
          transition: background-color 0.2s ease;
        }

        .story-row:hover {
          background-color: rgba(230, 185, 159, 0.12);
        }

        .action-link {
          transition: color 0.2s ease;
        }

        @media (prefers-reduced-motion: reduce) {
          .page-enter,
          .story-enter {
            animation: none;
          }

          .editor-input,
          .story-row,
          .action-link {
            transition: none;
          }
        }
      `}</style>

      {/* HEADER */}
      <header className="border-b border-[#E6B99F]/70">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-[76px] flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl tracking-tight text-[#783F32]">
              The Journal
            </h1>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#9A8175] mt-0.5">
              Publishing studio
            </p>
          </div>

          <nav className="flex items-center gap-5 sm:gap-7">
            <button
              onClick={() => navigate("/")}
              className="hidden sm:block text-sm text-[#78645A] hover:text-[#783F32] transition-colors"
            >
              View website ↗
            </button>

            <button
              onClick={handleLogout}
              className="text-sm text-[#783F32] border-b border-[#B96F50] pb-1 hover:text-[#B96F50] transition-colors"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        {/* INTRODUCTION */}
        <section className="page-enter flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#B96F50] mb-4">
              Your writing space
            </p>

            <h2 className="font-serif text-4xl sm:text-5xl text-[#783F32] tracking-tight">
              Good stories begin here.
            </h2>

            <p className="text-sm sm:text-base text-[#927B6F] mt-4 max-w-lg leading-7">
              Create, edit and keep track of the ideas you want to share with the world.
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="shrink-0 bg-[#783F32] text-white px-6 py-3 text-sm hover:bg-[#9A5543] transition-colors"
          >
            + Write a story
          </button>
        </section>

        {/* NOTIFICATIONS */}
        {success && (
          <div className="page-enter mb-7 py-3 border-y border-[#B96F50]/40 text-sm text-[#783F32] flex justify-between gap-4">
            <span>{success}</span>
            <button
              onClick={() => setSuccess("")}
              aria-label="Dismiss notification"
              className="text-lg leading-none hover:text-[#B96F50]"
            >
              ×
            </button>
          </div>
        )}

        {error && !showForm && (
          <div className="page-enter mb-7 py-3 border-y border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* EDITOR */}
        {showForm && (
          <section
            id="blog-form"
            className="page-enter mb-16 border-y border-[#D8AE98] py-8 sm:py-10"
          >
            <div className="flex justify-between items-start gap-4 mb-9">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#B96F50] mb-3">
                  {editingId ? "Editing" : "New entry"}
                </p>

                <h3 className="font-serif text-3xl sm:text-4xl text-[#783F32]">
                  {editingId ? "Shape your story." : "Put your thoughts into words."}
                </h3>

                <p className="text-sm text-[#927B6F] mt-3">
                  Take your time. Every detail matters.
                </p>
              </div>

              <button
                onClick={closeForm}
                aria-label="Close form"
                className="text-2xl text-[#927B6F] hover:text-[#783F32]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              <div>
                <label className="block text-sm text-[#783F32] mb-2">
                  Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Give your story a title"
                  required
                  className="editor-input w-full bg-white/50 border border-[#D8AE98] px-4 py-3.5 text-sm text-[#3D302B] placeholder:text-[#B9A59A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-[#783F32] mb-2">
                    Category
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="editor-input w-full bg-white/50 border border-[#D8AE98] px-4 py-3.5 text-sm text-[#3D302B]"
                  >
                    <option>Technology</option>
                    <option>Programming</option>
                    <option>Lifestyle</option>
                    <option>Travel</option>
                    <option>Personal</option>
                    <option>Education</option>
                    <option>General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#783F32] mb-2">
                    Cover image URL
                  </label>

                  <input
                    type="url"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="editor-input w-full bg-white/50 border border-[#D8AE98] px-4 py-3.5 text-sm text-[#3D302B] placeholder:text-[#B9A59A]"
                  />
                </div>
              </div>

              {form.image && (
                <div className="page-enter">
                  <p className="text-xs text-[#927B6F] mb-2">
                    Image preview
                  </p>

                  <img
                    src={form.image}
                    alt="Story cover preview"
                    className="w-full max-w-sm h-44 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-[#783F32] mb-2">
                  Content
                </label>

                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  placeholder="Start writing here..."
                  rows={10}
                  required
                  className="editor-input w-full bg-white/50 border border-[#D8AE98] px-4 py-4 text-sm text-[#3D302B] placeholder:text-[#B9A59A] resize-y leading-7"
                />
              </div>

              {error && (
                <p className="text-sm text-red-700 border-l-2 border-red-400 pl-3">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-5 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#783F32] text-white px-7 py-3 text-sm hover:bg-[#9A5543] disabled:opacity-60 transition-colors"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Save changes"
                    : "Publish story"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  className="text-sm text-[#927B6F] hover:text-[#783F32] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* STORY LIBRARY */}
        <section className="page-enter">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 border-b border-[#D8AE98] pb-5 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#B96F50] mb-3">
                The collection
              </p>

              <h3 className="font-serif text-3xl text-[#783F32]">
                Your stories
              </h3>
            </div>

            <p className="text-sm text-[#927B6F]">
              {blogs.length} {blogs.length === 1 ? "story" : "stories"} published
            </p>
          </div>

          {/* SEARCH */}
          <div className="mb-7 max-w-md">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your stories..."
              aria-label="Search stories"
              className="editor-input w-full bg-transparent border-b border-[#D8AE98] py-3 text-sm text-[#3D302B] placeholder:text-[#A99488]"
            />
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="py-20 text-center text-sm text-[#927B6F]">
              Loading your stories...
            </div>
          ) : blogs.length === 0 ? (
            /* EMPTY STATE */
            <div className="py-16 border-y border-[#D8AE98]/70 text-center">
              <h4 className="font-serif text-2xl text-[#783F32]">
                A blank page is a good beginning.
              </h4>

              <p className="text-sm text-[#927B6F] mt-3">
                Your first story is waiting to be written.
              </p>

              <button
                onClick={openCreateForm}
                className="mt-6 text-sm text-[#B96F50] border-b border-[#B96F50] pb-1 hover:text-[#783F32]"
              >
                Write your first story →
              </button>
            </div>
          ) : filteredBlogs.length === 0 ? (
            /* NO SEARCH RESULTS */
            <div className="py-16 text-center border-y border-[#D8AE98]/70">
              <p className="font-serif text-xl text-[#783F32]">
                No stories found.
              </p>

              <p className="text-sm text-[#927B6F] mt-2">
                Try a different search term.
              </p>

              <button
                onClick={() => setSearch("")}
                className="mt-4 text-sm text-[#B96F50] border-b border-[#B96F50] pb-1"
              >
                Clear search
              </button>
            </div>
          ) : (
            /* BLOG LIST */
            <div>
              {filteredBlogs.map((blog) => (
                <article
                  key={blog._id}
                  className="story-row story-enter flex flex-col sm:flex-row gap-5 sm:gap-7 py-7 px-3 border-b border-[#E6B99F]/70"
                >
                  {blog.image && (
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full sm:w-32 h-44 sm:h-28 object-cover shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-[#B96F50]">
                        {blog.category || "General"}
                      </span>

                      {blog.createdAt && (
                        <>
                          <span className="text-[#C6A18F]">/</span>
                          <span className="text-xs text-[#A18B7F]">
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

                    <h4 className="font-serif text-xl sm:text-2xl text-[#783F32] leading-snug">
                      {blog.title}
                    </h4>

                    <p className="text-sm text-[#927B6F] mt-2 leading-6 line-clamp-2">
                      {blog.content}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-start sm:justify-center gap-5 sm:gap-3 sm:min-w-[65px]">
                    <button
                      onClick={() => handleEdit(blog)}
                      className="action-link text-sm text-[#B96F50] hover:text-[#783F32]"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="action-link text-sm text-[#A65A4D] hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="mt-20 pt-5 border-t border-[#D8AE98]/70 flex flex-col sm:flex-row justify-between gap-2 text-xs text-[#A18B7F]">
          <p>© {new Date().getFullYear()} The Journal</p>
          <p>A space for stories worth sharing.</p>
        </footer>
      </main>
    </div>
  );
}

export default AdminDashboard;
