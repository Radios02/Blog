import Database from "better-sqlite3";
const db = new Database('./data/blog.sqlite');

// Táblák létrehozása, ha nem léteznek
db.prepare(`
  CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`).run();

// Blogok listázása
export const getBlogs = () => db.prepare(`SELECT * FROM blogs`).all();

// Egy blog lekérdezése ID alapján
export const getBlog = (id) => db.prepare(`SELECT * FROM blogs WHERE id = ?`).get(id);

// Új blog mentése
export const saveBlog = (author, title, category, content) => {
  const now = new Date().toISOString();
  return db.prepare(`
    INSERT INTO blogs (author, title, category, content, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(author, title, category, content, now, now);
};

// Blog frissítése
export const updateBlog = (id, title, category, content, created_at) => {
  const now = new Date().toISOString();
  return db.prepare(`
    UPDATE blogs
    SET title = ?, category = ?, content = ?, created_at = ?, updated_at = ?
    WHERE id = ?
  `).run(title, category, content, created_at, now, id);
};

// Blog törlése
export const deleteBlog = (id) => db.prepare(`DELETE FROM blogs WHERE id = ?`).run(id);

// Példa adatok hozzáadása, ha az adatbázis üres
const blogs = [
  { author: 'John Doe', title: 'Első Blog', category: 'Tech', content: 'Ez az első blogbejegyzés.', created_at: '2025-05-01', updated_at: '2025-05-02' },
  { author: 'Jane Smith', title: 'Második Blog', category: 'Lifestyle', content: 'Ez a második blogbejegyzés.', created_at: '2025-05-03', updated_at: '2025-05-04' }
];

blogs.forEach(blog => {
  const existingBlog = db.prepare(`SELECT * FROM blogs WHERE title = ? AND content = ?`).get(blog.title, blog.content);
  if (!existingBlog) {
    saveBlog(blog.author, blog.title, blog.category, blog.content);
  }
});