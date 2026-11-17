
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
  projectUrl: "",
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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Authentication
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

  // Fetch blogs
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

  // Dynamic categories
  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        blogs
          .map((blog) => blog.category || "General")
          .filter(Boolean)
      ),
    ];
  }, [blogs]);

  // Filter and search
  const filteredBlogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return blogs.filter((blog) => {
      const matchesCategory =
        selectedCategory === "All" ||
        (blog.category || "General") === selectedCategory;

      const matchesSearch =
        !query ||
        blog.title?.toLowerCase().includes(query) ||
        blog.category?.toLowerCase().includes(query) ||
        blog.content?.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [blogs, search, selectedCategory]);

  // Form input
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Image upload
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setImageFile(file);

    setImagePreview((previousPreview) => {
      if (previousPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(previousPreview);
      }

      return URL.createObjectURL(file);
    });
  };

  // Reset image
  const resetImage = () => {
    setImageFile(null);

    setImagePreview((previousPreview) => {
      if (previousPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(previousPreview);
      }

      return "";
    });
  };

  // Create form
  const openCreateForm = () => {
    setEditingId(null);
    setForm(initialForm);
    resetImage();
    setError("");
    setSuccess("");
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Edit form
  const handleEdit = (blog) => {
    setEditingId(blog._id);

    setForm({
      title: blog.title || "",
      content: blog.content || "",
      image: blog.image || "",
      category: blog.category || "Technology",
      projectUrl: blog.projectUrl || "",
    });

    resetImage();
    setImagePreview(blog.image || "");

    setError("");
    setSuccess("");
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Publish or update
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!editingId && !imageFile) {
        setError("Please select a cover image.");
        return;
      }

      const config = await getAuthConfig();
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("content", form.content);
      formData.append("category", form.category);
      formData.append("projectUrl", form.projectUrl);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editingId) {
        const response = await axios.put(
          `${BLOGS_API_URL}/${editingId}`,
          formData,
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
          formData,
          config
        );

        const newBlog = response.data.blog || response.data;

        setBlogs((prev) => [newBlog, ...prev]);
        setSuccess("Your story has been published successfully.");
      }

      setForm(initialForm);
      resetImage();
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

  // Delete
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this story?"
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

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("adminToken");
      navigate("/admin/login", { replace: true });
    } catch {
      setError("Unable to log out. Please try again.");
    }
  };

  // Close form
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
    resetImage();
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#F3E8D2] text-[#34251F]">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');

        .dashboard-page {
          font-family: 'DM Sans', sans-serif;
        }

        .serif-heading {
          font-family: 'Playfair Display', serif;
        }

        .dashboard-nav {
          box-shadow: 0 5px 20px rgba(74, 48, 33, 0.07);
        }

        .dashboard-row {
          background: rgba(225, 211, 186, 0.65);
          transition: background 0.25s ease, transform 0.25s ease;
        }

        .dashboard-row:hover {
          background: rgba(232, 218, 194, 0.95);
          transform: translateY(-2px);
        }

        .filter-pill {
          transition: all 0.2s ease;
        }

        .editor-input {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .editor-input:focus {
          border-color: #783F32;
          box-shadow: 0 0 0 3px rgba(120, 63, 50, 0.08);
          outline: none;
        }

        .dashboard-enter {
          animation: dashboardAppear 0.4s ease both;
        }

        @keyframes dashboardAppear {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="dashboard-page">

        {/* FIXED NAVIGATION */}
        <header className="fixed top-0 left-0 w-full z-50 px-4 pt-4">
          <div className="dashboard-nav max-w-4xl mx-auto min-h-[70px] rounded-full border border-[#E4D5B9] bg-[#F5EBD9]/95 backdrop-blur-md px-5 sm:px-8 flex items-center justify-between gap-4">

            <button
              onClick={() => navigate("/")}
              className="serif-heading text-xl sm:text-2xl font-semibold tracking-wide text-[#783F32]"
            >
              The Journal<span className="text-[#B96F50]">.</span>
            </button>

            <nav className="hidden md:flex items-center gap-8 text-sm text-[#796A59]">
              <button
                onClick={() => navigate("/")}
                className="hover:text-[#783F32] transition"
              >
                Website
              </button>

              <button
                onClick={() =>
                  document.getElementById("story-library")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
                className="hover:text-[#783F32] transition"
              >
                My Stories
              </button>

              <button
                onClick={openCreateForm}
                className="hover:text-[#783F32] transition"
              >
                Write
              </button>
            </nav>

            <button
              onClick={handleLogout}
              className="rounded-full bg-[#641D26] text-[#FFF8EB] px-6 py-3 text-sm font-semibold hover:bg-[#783F32] transition"
            >
              Log out
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-5 sm:px-8 pt-28 sm:pt-32 pb-20">

          {/* DASHBOARD HEADING */}
          <section className="dashboard-enter flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-9">

            <div>
              <p className="text-xs tracking-[0.25em] text-[#A27D62] uppercase mb-2">
                Publishing studio
              </p>

              <h1 className="serif-heading text-3xl sm:text-4xl tracking-[0.12em] text-[#641D26]">
                DASHBOARD
              </h1>

              <p className="text-sm text-[#8B7965] mt-3">
                Manage your stories and share your ideas.
              </p>
            </div>

            <button
              onClick={openCreateForm}
              className="self-start sm:self-auto rounded-full bg-[#641D26] text-[#FFF8EB] px-7 py-4 text-sm font-semibold hover:bg-[#783F32] hover:-translate-y-0.5 transition"
            >
              <span className="text-lg mr-2">+</span>
              New Post
            </button>
          </section>

          {/* SUMMARY */}
          <div className="flex flex-wrap gap-x-8 gap-y-2 mb-8 text-sm text-[#82715F]">
            <p>
              <span className="font-semibold text-[#641D26]">
                {blogs.length}
              </span>{" "}
              {blogs.length === 1 ? "story" : "stories"} in your collection
            </p>

            <p>
              <span className="font-semibold text-[#641D26]">
                {categories.length - 1}
              </span>{" "}
              {categories.length - 1 === 1 ? "category" : "categories"}
            </p>
          </div>

          {/* NOTIFICATIONS */}
          {success && (
            <div className="dashboard-enter mb-6 rounded-xl bg-[#E5E8D6] px-5 py-4 text-sm text-[#435B36] flex justify-between gap-4">
              <span>✓ {success}</span>
              <button onClick={() => setSuccess("")}>×</button>
            </div>
          )}

          {error && !showForm && (
            <div className="mb-6 rounded-xl bg-[#F4DDDA] px-5 py-4 text-sm text-[#9B3434]">
              {error}
            </div>
          )}

          {/* CREATE / EDIT FORM */}
          {showForm && (
            <section
              id="blog-form"
              className="dashboard-enter mb-12 rounded-3xl border border-[#E0CFB1] bg-[#F8EFDF] p-5 sm:p-9 shadow-sm"
            >
              <div className="flex justify-between gap-4 mb-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#A27D62] mb-2">
                    {editingId ? "Edit story" : "Create something new"}
                  </p>

                  <h2 className="serif-heading text-3xl text-[#641D26]">
                    {editingId ? "Update your post" : "New post"}
                  </h2>
                </div>

                <button
                  onClick={closeForm}
                  aria-label="Close form"
                  className="text-2xl text-[#8B7965] hover:text-[#641D26]"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                <div>
                  <label className="block text-sm font-medium text-[#641D26] mb-2">
                    Story title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Give your story a title..."
                    required
                    className="editor-input w-full rounded-xl border border-[#DCC9A9] bg-[#FFF9EF] px-4 py-3.5 text-sm"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#641D26] mb-2">
                      Category
                    </label>

                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="editor-input w-full rounded-xl border border-[#DCC9A9] bg-[#FFF9EF] px-4 py-3.5 text-sm"
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
                    <label className="block text-sm font-medium text-[#641D26] mb-2">
                      Cover image
                    </label>

                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      required={!editingId}
                      className="editor-input w-full rounded-xl border border-[#DCC9A9] bg-[#FFF9EF] px-3 py-3 text-sm"
                    />

                    <p className="text-xs text-[#9A846D] mt-2">
                      Image file, maximum 5 MB.
                    </p>
                  </div>
                </div>

                {imagePreview && (
                  <div>
                    <p className="text-xs text-[#8B7965] mb-2">
                      Image preview
                    </p>

                    <img
                      src={imagePreview}
                      alt="Cover preview"
                      className="w-full max-w-sm h-48 object-cover rounded-xl"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#641D26] mb-2">
                    Project URL
                  </label>

                  <input
                    type="url"
                    name="projectUrl"
                    value={form.projectUrl}
                    onChange={handleChange}
                    placeholder="https://your-project.vercel.app"
                    className="editor-input w-full rounded-xl border border-[#DCC9A9] bg-[#FFF9EF] px-4 py-3.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#641D26] mb-2">
                    Story content
                  </label>

                  <textarea
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    placeholder="Start writing your story..."
                    rows={10}
                    required
                    className="editor-input w-full rounded-xl border border-[#DCC9A9] bg-[#FFF9EF] px-4 py-4 text-sm leading-7 resize-y"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-700">{error}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-[#641D26] text-white px-8 py-3.5 text-sm font-semibold hover:bg-[#783F32] disabled:opacity-60 transition"
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                      ? "Save changes"
                      : "Publish post"}
                  </button>

                  <button
                    type="button"
                    onClick={closeForm}
                    className="text-sm text-[#82715F] hover:text-[#641D26]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* STORY LIBRARY */}
          <section id="story-library" className="dashboard-enter">

            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#A27D62] mb-2">
                  Your collection
                </p>

                <h2 className="serif-heading text-2xl sm:text-3xl text-[#641D26]">
                  Manage Posts
                </h2>
              </div>

              <span className="text-xs text-[#927E69]">
                {filteredBlogs.length} results
              </span>
            </div>

            {/* CATEGORY FILTERS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-5">
              {categories.map((category) => {
                const active = selectedCategory === category;

                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`filter-pill shrink-0 rounded-full px-5 py-2.5 text-sm ${
                      active
                        ? "bg-[#641D26] text-[#FFF8EB] font-semibold"
                        : "bg-[#E9DEC9] text-[#786A58] hover:bg-[#E2D2B7]"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {/* SEARCH */}
            <div className="flex items-center gap-3 mb-7 max-w-md rounded-full border border-[#E0D0B5] bg-[#F7EDDC] px-5">
              <span className="text-[#9A846D]">⌕</span>

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find a story..."
                aria-label="Search stories"
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-[#A9947D]"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="text-[#927E69]"
                >
                  ×
                </button>
              )}
            </div>

            {/* LOADING */}
            {loading ? (
              <div className="py-20 text-center text-sm text-[#927E69]">
                Loading your stories...
              </div>
            ) : blogs.length === 0 ? (
              <div className="rounded-2xl bg-[#E9DEC9] px-6 py-16 text-center">
                <h3 className="serif-heading text-2xl text-[#641D26]">
                  Your journal starts here.
                </h3>

                <p className="text-sm text-[#927E69] mt-3">
                  You haven't published any stories yet.
                </p>

                <button
                  onClick={openCreateForm}
                  className="mt-6 rounded-full bg-[#641D26] text-white px-6 py-3 text-sm"
                >
                  + Create your first post
                </button>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-[#E9DEC9]">
                <h3 className="serif-heading text-xl text-[#641D26]">
                  No matching stories.
                </h3>

                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("All");
                  }}
                  className="mt-4 text-sm text-[#9A5543] underline underline-offset-4"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBlogs.map((blog) => (
                  <article
                    key={blog._id}
                    className="dashboard-row dashboard-enter rounded-2xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
                  >
                    {/* IMAGE */}
                    {blog.image && (
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-full sm:w-[105px] h-36 sm:h-[76px] rounded-xl object-cover shrink-0"
                      />
                    )}

                    {/* STORY DETAILS */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5 mb-2">
                        <span className="rounded-md bg-[#B7A68B] text-white px-3 py-1 text-[10px] font-semibold tracking-wider uppercase">
                          {blog.category || "General"}
                        </span>

                        <span className="text-[10px] uppercase tracking-wider text-[#567B45] font-bold">
                          Published
                        </span>

                        {blog.createdAt && (
                          <span className="text-xs text-[#9A8975]">
                            {new Date(blog.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-medium text-[#34251F] leading-snug break-words">
                        {blog.title}
                      </h3>

                      {blog.projectUrl && (
                        <a
                          href={blog.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-xs text-[#9A5543] hover:text-[#641D26] underline underline-offset-4"
                        >
                          View Project ↗
                        </a>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center justify-end gap-2 sm:gap-3 border-t sm:border-t-0 border-[#D7C5A8] pt-3 sm:pt-0">

                      <button
                        onClick={() => navigate(`/blog/${blog._id}`)}
                        title="View story"
                        aria-label="View story"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-[#857762] hover:bg-[#E4D4B9] hover:text-[#641D26] transition"
                      >
                        <span className="text-lg">↗</span>
                      </button>

                      <button
                        onClick={() => handleEdit(blog)}
                        title="Edit story"
                        aria-label="Edit story"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-[#857762] hover:bg-[#E4D4B9] hover:text-[#641D26] transition"
                      >
                        <span className="text-lg">✎</span>
                      </button>

                      <button
                        onClick={() => handleDelete(blog._id)}
                        title="Delete story"
                        aria-label="Delete story"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-[#A54B55] hover:bg-[#F0D9D8] hover:text-red-800 transition"
                      >
                        <span className="text-lg">♧</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* FOOTER */}
          <footer className="mt-16 pt-6 border-t border-[#DCC9A9] flex flex-col sm:flex-row justify-between gap-2 text-xs text-[#9A8975]">
            <p>© {new Date().getFullYear()} The Journal</p>
            <p>A space for stories worth sharing.</p>
          </footer>

        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
