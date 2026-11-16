
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

const API_URL = "http://localhost:5000/api/blogs";

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

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  // Get a fresh Firebase ID token for protected API requests
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

  // Check Firebase authentication and fetch blogs
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
        const response = await axios.get(API_URL, config);

        const data = response.data;

        setBlogs(
          Array.isArray(data) ? data : data.blogs || []
        );
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

  // Handle form inputs
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Open create form
  const openCreateForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setShowForm(true);
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
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Create or update blog
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const config = await getAuthConfig();

      if (editingId) {
        const response = await axios.put(
          `${API_URL}/${editingId}`,
          form,
          config
        );

        const updatedBlog = response.data.blog || response.data;

        setBlogs((prev) =>
          prev.map((blog) =>
            blog._id === editingId ? updatedBlog : blog
          )
        );
      } else {
        const response = await axios.post(
          API_URL,
          form,
          config
        );

        const newBlog = response.data.blog || response.data;

        setBlogs((prev) => [newBlog, ...prev]);
      }

      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);
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
      "Are you sure you want to delete this blog?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const config = await getAuthConfig();

      await axios.delete(`${API_URL}/${id}`, config);

      setBlogs((prev) =>
        prev.filter((blog) => blog._id !== id)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to delete blog."
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

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#FAF3EA] text-[#3D302B]">

      {/* HEADER */}
      <header className="border-b border-[#E6B99F]/50 bg-[#FAF3EA]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#783F32]">
              The Journal
            </h1>

            <p className="text-xs text-[#9A8175] mt-1 tracking-widest uppercase">
              Publishing Studio
            </p>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate("/")}
              className="hidden sm:block text-sm text-[#783F32] hover:text-[#B96F50]"
            >
              View Website ↗
            </button>

            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-[#783F32] border border-[#B96F50]/40 px-4 py-2 rounded-lg hover:bg-[#783F32] hover:text-white transition"
            >
              Logout
            </button>
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-12">

        {/* PAGE INTRO */}
        <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">

          <div>
            <p className="text-sm text-[#B96F50] font-medium mb-3">
              YOUR WORKSPACE
            </p>

            <h2 className="text-4xl md:text-5xl font-bold text-[#783F32] tracking-tight">
              Dashboard
            </h2>

            <p className="text-[#9A8175] mt-3">
              Manage your stories and keep your journal growing.
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="bg-[#783F32] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#B96F50] transition w-fit"
          >
            + Write a Story
          </button>

        </section>

        {/* STATISTICS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 border-y border-[#E6B99F] mb-12">

          <div className="py-7 sm:pr-8">
            <p className="text-sm text-[#9A8175]">
              Total Stories
            </p>

            <h3 className="text-4xl font-bold text-[#783F32] mt-2">
              {blogs.length}
            </h3>
          </div>

          <div className="py-7 sm:px-8 border-t sm:border-t-0 sm:border-l border-[#E6B99F]">
            <p className="text-sm text-[#9A8175]">
              Categories
            </p>

            <h3 className="text-4xl font-bold text-[#783F32] mt-2">
              {new Set(blogs.map((blog) => blog.category).filter(Boolean)).size}
            </h3>
          </div>

          <div className="py-7 sm:pl-8 border-t sm:border-t-0 sm:border-l border-[#E6B99F]">
            <p className="text-sm text-[#9A8175]">
              Latest Story
            </p>

            <h3 className="text-lg font-semibold text-[#783F32] mt-3">
              {blogs.length > 0 ? "Published" : "No stories yet"}
            </h3>
          </div>

        </section>

        {/* CREATE / EDIT FORM */}
        {showForm && (
          <section className="bg-white/60 border border-[#E6B99F] rounded-2xl p-6 md:p-9 mb-12">

            <div className="flex justify-between items-center mb-7">
              <div>
                <p className="text-xs tracking-widest text-[#B96F50] uppercase mb-2">
                  {editingId ? "EDIT STORY" : "NEW STORY"}
                </p>

                <h3 className="text-2xl font-bold text-[#783F32]">
                  {editingId ? "Update your story" : "Write something new"}
                </h3>
              </div>

              <button
                onClick={closeForm}
                className="text-[#9A8175] hover:text-[#783F32] text-2xl"
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="block text-sm font-semibold text-[#783F32] mb-2">
                  Story Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Give your story a title"
                  required
                  className="w-full bg-[#FAF3EA] border border-[#E6B99F] rounded-lg px-4 py-3 outline-none focus:border-[#783F32]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-semibold text-[#783F32] mb-2">
                    Category
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full bg-[#FAF3EA] border border-[#E6B99F] rounded-lg px-4 py-3 outline-none focus:border-[#783F32]"
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
                  <label className="block text-sm font-semibold text-[#783F32] mb-2">
                    Cover Image URL
                  </label>

                  <input
                    type="url"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-[#FAF3EA] border border-[#E6B99F] rounded-lg px-4 py-3 outline-none focus:border-[#783F32]"
                  />
                </div>

              </div>

              <div>
                <label className="block text-sm font-semibold text-[#783F32] mb-2">
                  Your Story
                </label>

                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  placeholder="Start writing your story..."
                  rows={8}
                  required
                  className="w-full bg-[#FAF3EA] border border-[#E6B99F] rounded-lg px-4 py-3 outline-none focus:border-[#783F32] resize-y"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#783F32] text-white px-7 py-3 rounded-lg font-semibold text-sm hover:bg-[#B96F50] transition disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Story"
                    : "Publish Story"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  className="border border-[#B96F50]/50 text-[#783F32] px-7 py-3 rounded-lg text-sm hover:bg-[#E6B99F]/30 transition"
                >
                  Cancel
                </button>
              </div>

            </form>
          </section>
        )}

        {/* BLOG LIST */}
        <section>

          <div className="flex items-center justify-between border-b border-[#E6B99F] pb-5 mb-6">
            <div>
              <p className="text-xs tracking-widest text-[#B96F50] uppercase mb-2">
                CONTENT LIBRARY
              </p>

              <h3 className="text-2xl font-bold text-[#783F32]">
                Your Stories
              </h3>
            </div>

            <span className="text-sm text-[#9A8175]">
              {blogs.length} posts
            </span>
          </div>

          {error && !showForm && (
            <p className="text-sm text-red-600 mb-5">{error}</p>
          )}

          {loading ? (
            <p className="text-[#9A8175] py-12 text-center">
              Loading your stories...
            </p>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20 border-b border-[#E6B99F]">
              <p className="text-3xl mb-4">✍</p>

              <h4 className="text-xl font-semibold text-[#783F32]">
                Your journal is waiting.
              </h4>

              <p className="text-sm text-[#9A8175] mt-2">
                Publish your first story and it will appear here.
              </p>

              <button
                onClick={openCreateForm}
                className="mt-6 text-[#B96F50] font-semibold text-sm hover:text-[#783F32]"
              >
                Write your first story →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#E6B99F]/70">

              {blogs.map((blog) => (
                <article
                  key={blog._id}
                  className="py-6 flex flex-col sm:flex-row gap-5 sm:items-center"
                >

                  {blog.image && (
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full sm:w-32 h-44 sm:h-24 object-cover rounded-lg"
                    />
                  )}

                  <div className="flex-1 min-w-0">

                    <p className="text-xs uppercase tracking-widest text-[#B96F50] mb-2">
                      {blog.category || "General"}
                    </p>

                    <h4 className="text-xl font-semibold text-[#783F32] mb-2">
                      {blog.title}
                    </h4>

                    <p className="text-sm text-[#9A8175] line-clamp-2">
                      {blog.content}
                    </p>

                    <p className="text-xs text-[#A18B7F] mt-3">
                      {blog.createdAt
                        ? new Date(blog.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : ""}
                    </p>

                  </div>

                  <div className="flex items-center gap-5 sm:ml-auto">
                    <button
                      onClick={() => handleEdit(blog)}
                      className="text-sm font-semibold text-[#B96F50] hover:text-[#783F32]"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="text-sm font-semibold text-red-700 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>

                </article>
              ))}

            </div>
          )}

        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#E6B99F]/60 mt-16">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-[#9A8175]">
          <p>© {new Date().getFullYear()} The Journal</p>
          <p>Made for stories worth sharing.</p>
        </div>
      </footer>

    </div>
  );
}

export default AdminDashboard;
