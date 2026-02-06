// Mock API for Deployment (localStorage)
// Replaces Axios with a client-side database simulation

const LATENCY = 300; // ms to simulate network

// Helper to access DB
const db = {
  getPosts: () => JSON.parse(localStorage.getItem("db_posts") || "[]"),
  savePosts: (posts) => localStorage.setItem("db_posts", JSON.stringify(posts)),
};

// Seed initial data if empty
if (!localStorage.getItem("db_posts")) {
  const seedPosts = [
    {
      id: 1,
      user: "Admin",
      user_email: "admin@oldworld.com",
      user_avatar: "https://ui-avatars.com/api/?name=Admin&background=000&color=fff",
      content: "Welcome to OldWorld! This is a persistent demo using local storage.",
      image: null,
      created_at: new Date().toISOString(),
      likes: 0
    }
  ];
  db.savePosts(seedPosts);
}

const mockApi = {
  // Mock Axios Create
  create: () => mockApi,

  // Mock Interceptors (No-op)
  interceptors: {
    request: { use: () => { } },
    response: { use: () => { } }
  },

  // Mock GET
  get: (url) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (url === "/posts") {
          const posts = db.getPosts();
          resolve({ data: posts });
        } else {
          console.warn(`Mock API: Unhandled GET ${url}`);
          resolve({ data: [] });
        }
      }, LATENCY);
    });
  },

  // Mock POST
  post: (url, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (url === "/posts") {
          // Handle Post Creation
          // Supports both { post: { ... } } wrapper and direct object
          const payload = data.post || data;

          const newPost = {
            id: Date.now(),
            ...payload,
            // Ensure essential fields exist
            content: payload.content || payload.body || "",
            likes: 0,
            created_at: new Date().toISOString()
          };

          const posts = db.getPosts();
          // Add to beginning of array
          const updatedPosts = [newPost, ...posts];
          db.savePosts(updatedPosts);

          resolve({ data: newPost });
        } else {
          console.warn(`Mock API: Unhandled POST ${url}`);
          resolve({ data: {} });
        }
      }, LATENCY);
    });
  }
};

export default mockApi;
