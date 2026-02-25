
import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import cors from "cors";
import admin from "firebase-admin";

// Firebase Initialization
let db: admin.firestore.Firestore | null = null;
let firebaseStatus = "DISCONNECTED";

try {
  console.log("Initializing Firebase...");
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    try {
      privateKey = privateKey.trim();
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.substring(1, privateKey.length - 1);
      }
      if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
        privateKey = privateKey.substring(1, privateKey.length - 1);
      }
      privateKey = privateKey.replace(/\\n/g, '\n');

      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        console.log("Firebase App initialized");
      }
      db = admin.firestore();
      firebaseStatus = "CONNECTED";
      console.log("Firestore connected successfully");
    } catch (error: any) {
      const errMsg = error.message || "Unknown error during SDK init";
      console.error("Firebase Init Error:", errMsg);
      firebaseStatus = `ERROR: ${errMsg}`;
    }
  } else {
    const missing = [];
    if (!projectId) missing.push("PROJECT_ID");
    if (!clientEmail) missing.push("CLIENT_EMAIL");
    if (!privateKey) missing.push("PRIVATE_KEY");
    
    console.warn(`Firebase credentials missing: ${missing.join(", ")}`);
    firebaseStatus = missing.length > 0 ? `MISSING: ${missing.join(", ")}` : "LOCAL_ONLY";
  }
} catch (error: any) {
  console.error("Critical Firebase Setup Error:", error.message);
  firebaseStatus = `CRITICAL_ERROR: ${error.message}`;
}

const DATA_FILE = path.join(process.cwd(), "data.json");
const isVercel = process.env.VERCEL === "1";

// Initialize data file if it doesn't exist (only if NOT on Vercel)
if (!isVercel && !fs.existsSync(DATA_FILE)) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({
      users: [],
      loans: [],
      notifications: [],
      budget: 30000000,
      rankProfit: 0
    }, null, 2));
  } catch (e) {
    console.warn("Could not create local data.json:", e);
  }
}

async function readData() {
  if (db) {
    try {
      const usersSnap = await db.collection("users").get();
      const loansSnap = await db.collection("loans").get();
      const notifsSnap = await db.collection("notifications").orderBy("id", "desc").limit(200).get();
      const systemSnap = await db.collection("system").doc("config").get();

      const users = usersSnap.docs.map(doc => doc.data());
      const loans = loansSnap.docs.map(doc => doc.data());
      const notifications = notifsSnap.docs.map(doc => doc.data());
      const systemData = systemSnap.exists ? systemSnap.data() : { budget: 30000000, rankProfit: 0 };

      return {
        users,
        loans,
        notifications,
        budget: systemData?.budget ?? 30000000,
        rankProfit: systemData?.rankProfit ?? 0
      };
    } catch (e) {
      console.error("Error reading from Firebase:", e);
      // Fallback to local if Firebase fails
    }
  }

  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return {
      users: [],
      loans: [],
      notifications: [],
      budget: 30000000,
      rankProfit: 0
    };
  }
}

async function writeData(data: any) {
  if (db) {
    try {
      // This is a naive implementation that overwrites everything.
      // In a real app, we'd update individual docs.
      // But to keep it compatible with the current logic:
      
      // Update system config
      await db.collection("system").doc("config").set({
        budget: data.budget,
        rankProfit: data.rankProfit
      }, { merge: true });

      // Note: We don't bulk update users/loans/notifs here because the routes handle them individually or in batches.
      // The current routes call writeData(data) after modifying the whole object.
      // We'll refactor the routes to be more Firestore-friendly.
      return;
    } catch (e) {
      console.error("Error writing to Firebase:", e);
    }
  }
  if (!isVercel) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error("Error writing to local file:", e);
    }
  }
}

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

  // Health check
  app.get("/health", (req, res) => {
    res.send("OK");
  });

  // Firebase status
  app.get("/api/firebase-status", (req, res) => {
    res.json({ status: firebaseStatus });
  });

  // Test DB connection
  app.get("/test-db", async (req, res) => {
    try {
      if (!db) {
        return res.json({ status: "ERROR", error: "Firebase not initialized (db is null)" });
      }
      const snapshot = await db.collection("test").get();
      res.json({ status: "OK", count: snapshot.size });
    } catch (error: any) {
      res.json({ status: "ERROR", error: error.message });
    }
  });

  // API Routes
  app.get("/api/data", async (req, res) => {
    try {
      const data = await readData();
      res.json(data);
    } catch (e: any) {
      console.error("Lỗi trong /api/data:", e.message);
      res.status(500).json({ error: "Internal Server Error", details: e.message });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const incomingUsers = req.body;
      if (!Array.isArray(incomingUsers)) {
        return res.status(400).json({ error: "Invalid data format: expected array" });
      }

      if (db) {
        // Firestore batch limit is 500 operations
        const chunks = [];
        for (let i = 0; i < incomingUsers.length; i += 400) {
          chunks.push(incomingUsers.slice(i, i + 400));
        }

        for (const chunk of chunks) {
          const batch = db.batch();
          chunk.forEach((u: any) => {
            if (u.id) {
              const ref = db!.collection("users").doc(u.id);
              batch.set(ref, u, { merge: true });
            }
          });
          await batch.commit();
        }
      } else {
        const data = await readData();
        const userMap = new Map(data.users.map((u: any) => [u.id, u]));
        incomingUsers.forEach((u: any) => {
          if (u.id) userMap.set(u.id, u);
        });
        data.users = Array.from(userMap.values());
        await writeData(data);
      }
      res.json({ success: true });
    } catch (e: any) {
      console.error("Error in /api/users:", e.message);
      res.status(500).json({ error: "Internal Server Error", details: e.message });
    }
  });

  app.post("/api/loans", async (req, res) => {
    try {
      const incomingLoans = req.body;
      if (!Array.isArray(incomingLoans)) {
        return res.status(400).json({ error: "Invalid data format: expected array" });
      }

      if (db) {
        const chunks = [];
        for (let i = 0; i < incomingLoans.length; i += 400) {
          chunks.push(incomingLoans.slice(i, i + 400));
        }

        for (const chunk of chunks) {
          const batch = db.batch();
          chunk.forEach((l: any) => {
            if (l.id) {
              const ref = db!.collection("loans").doc(l.id);
              batch.set(ref, l, { merge: true });
            }
          });
          await batch.commit();
        }
      } else {
        const data = await readData();
        const loanMap = new Map(data.loans.map((l: any) => [l.id, l]));
        incomingLoans.forEach((l: any) => {
          if (l.id) loanMap.set(l.id, l);
        });
        data.loans = Array.from(loanMap.values());
        await writeData(data);
      }
      res.json({ success: true });
    } catch (e: any) {
      console.error("Error in /api/loans:", e.message);
      res.status(500).json({ error: "Internal Server Error", details: e.message });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const incomingNotifs = req.body;
      if (!Array.isArray(incomingNotifs)) {
        return res.status(400).json({ error: "Invalid data format: expected array" });
      }

      if (db) {
        const chunks = [];
        for (let i = 0; i < incomingNotifs.length; i += 400) {
          chunks.push(incomingNotifs.slice(i, i + 400));
        }

        for (const chunk of chunks) {
          const batch = db.batch();
          chunk.forEach((n: any) => {
            if (n.id) {
              const ref = db!.collection("notifications").doc(n.id);
              batch.set(ref, n, { merge: true });
            }
          });
          await batch.commit();
        }
      } else {
        const data = await readData();
        const notifMap = new Map(data.notifications.map((n: any) => [n.id, n]));
        incomingNotifs.forEach((n: any) => {
          if (n.id) notifMap.set(n.id, n);
        });
        data.notifications = Array.from(notifMap.values())
          .sort((a: any, b: any) => b.id.localeCompare(a.id))
          .slice(0, 200);
        await writeData(data);
      }
      res.json({ success: true });
    } catch (e: any) {
      console.error("Error in /api/notifications:", e.message);
      res.status(500).json({ error: "Internal Server Error", details: e.message });
    }
  });

  app.post("/api/budget", async (req, res) => {
    try {
      const { budget } = req.body;
      if (db) {
        await db.collection("system").doc("config").set({ budget }, { merge: true });
      } else {
        const data = await readData();
        data.budget = budget;
        await writeData(data);
      }
      res.json({ success: true });
    } catch (e) {
      console.error("Error in /api/budget:", e);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/rankProfit", async (req, res) => {
    try {
      const { rankProfit } = req.body;
      if (db) {
        await db.collection("system").doc("config").set({ rankProfit }, { merge: true });
      } else {
        const data = await readData();
        data.rankProfit = rankProfit;
        await writeData(data);
      }
      res.json({ success: true });
    } catch (e) {
      console.error("Error in /api/rankProfit:", e);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      if (db) {
        // Delete user
        await db.collection("users").doc(userId).delete();
        
        // Delete associated loans and notifications (simplified for now)
        const loansSnap = await db.collection("loans").where("userId", "==", userId).get();
        const notifsSnap = await db.collection("notifications").where("userId", "==", userId).get();
        
        const batch = db.batch();
        loansSnap.docs.forEach(doc => batch.delete(doc.ref));
        notifsSnap.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
      } else {
        const data = await readData();
        data.users = data.users.filter((u: any) => u.id !== userId);
        data.loans = data.loans.filter((l: any) => l.userId !== userId);
        data.notifications = data.notifications.filter((n: any) => n.userId !== userId);
        await writeData(data);
      }
      res.json({ success: true });
    } catch (e) {
      console.error("Error in /api/users delete:", e);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

// Vite middleware for development
const distPath = path.join(process.cwd(), "dist");

if (!isVercel && process.env.NODE_ENV !== "production") {
  console.log("Using Vite middleware");
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then(vite => {
    app.use(vite.middlewares);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
} else if (!isVercel) {
  console.log("Serving static files from dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    if (fs.existsSync(path.join(distPath, "index.html"))) {
      res.sendFile(path.join(distPath, "index.html"));
    } else {
      res.status(404).send("Frontend not built");
    }
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

export default app;
