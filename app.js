import express from "express";
import * as db from './util/database.js';
import path from "path";

const PORT = 8080;
const app = express();
app.use(express.json());

// Statikus fájlok kiszolgálása
app.use(express.static(path.join(process.cwd(), 'view')));

// Blogok listázása
app.get("/blogs", (req, res) => {
    try {
        const blogs = db.getBlogs();
        res.status(200).json(blogs);
    } catch (err) {
        res.status(500).json({ message: `${err}` });
    }
});

// Egy blog lekérdezése ID alapján
app.get("/blogs/:id", (req, res) => {
    try {
        const blog = db.getBlog(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.status(200).json(blog);
    } catch (err) {
        res.status(500).json({ message: `${err}` });
    }
});

// Új blog létrehozása
app.post("/blogs", (req, res) => {
    try {
        const { author, title, category, content } = req.body;
        if (!author || !title || !category || !content) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const saveBlog = db.saveBlog(author, title, category, content);
        if (saveBlog.changes !== 1) {
            return res.status(501).json({ message: "Blog save failed" });
        }
        res.status(201).json({ id: saveBlog.lastInsertRowid, author, title, category, content });
    } catch (err) {
        res.status(500).json({ message: `${err}` });
    }
});

// Blog frissítése
app.put("/blogs/:id", (req, res) => {
    try {
        const { title, category, content, created_at } = req.body;
        if (!title || !category || !content || !created_at) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const id = req.params.id;
        const updateBlog = db.updateBlog(id, title, category, content, created_at);
        if (updateBlog.changes !== 1) {
            return res.status(404).json({ message: "Blog not found or update failed" });
        }
        const updatedBlog = db.getBlog(id); // Frissített blog lekérdezése
        res.status(200).json(updatedBlog);
    } catch (err) {
        res.status(500).json({ message: `${err}` });
    }
});

// Blog törlése
app.delete("/blogs/:id", (req, res) => {
    try {
        const deleteBlog = db.deleteBlog(req.params.id);
        if (deleteBlog.changes !== 1) {
            return res.status(404).json({ message: "Blog delete failed" });
        }
        res.status(204).json({ message: "Blog deleted" });
    } catch (err) {
        res.status(500).json({ message: `${err}` });
    }
});

app.listen(PORT, () => {
    console.log(`Server runs on port ${PORT}`);
});

export const updateBlog = (id, title, category, content, created_at) => {
  const now = new Date().toISOString();
  return db.prepare(`
    UPDATE blogs
    SET title = ?, category = ?, content = ?, created_at = ?, updated_at = ?
    WHERE id = ?
  `).run(title, category, content, created_at, now, id);
};