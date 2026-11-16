
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/blogs"
        );

        setBlogs(response.data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setError("Unable to load blogs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading blogs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">

      {/* Header */}
      <header className="max-w-5xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          My Blog Portfolio
        </h1>

        <p className="text-gray-500">
          Explore my latest thoughts, stories and articles.
        </p>
      </header>

      {/* Blog Cards */}
      <main className="max-w-5xl mx-auto">
        {blogs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {blogs.map((blog) => (
              <Link
                to={`/blog/${blog._id}`}
                key={blog._id}
                className="block bg-white p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300"
              >
                {blog.image && (
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}

                <p className="text-sm text-teal-600 font-semibold mb-2">
                  {blog.category}
                </p>

                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  {blog.title}
                </h2>

                <p className="text-gray-600 line-clamp-3">
                  {blog.content}
                </p>

                <p className="text-teal-600 font-semibold mt-5">
                  Read More →
                </p>
              </Link>
            ))}

          </div>
        ) : (
          <p className="text-center text-gray-500">
            No blogs available yet.
          </p>
        )}
      </main>

    </div>
  );
}

export default Home;
