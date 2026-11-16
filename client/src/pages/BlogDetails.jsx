
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
          `http://localhost:5000/api/blogs/${id}`
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

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  if (!blog) {
    return <p className="text-center mt-10">Blog not found.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow">
        <Link to="/" className="text-teal-600">
          ← Back to Home
        </Link>

        <p className="text-teal-600 mt-6">{blog.category}</p>

        <h1 className="text-3xl font-bold my-4">
          {blog.title}
        </h1>

        {blog.image && (
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full rounded-lg mb-6"
          />
        )}

        <p className="text-gray-700 whitespace-pre-line leading-7">
          {blog.content}
        </p>
      </div>
    </div>
  );
}

export default BlogDetails;
