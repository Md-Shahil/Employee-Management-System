const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();  // Starts the server
app.use(cors());    // allows your React app to communicate with it
app.use(express.json());    // translates incoming text data into readable JavaScript objects
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const uploadDir = path.join(__dirname, "uploads");
// Checks the upload folder 
if (!fs.existsSync(uploadDir)) {
    // If folder not exists, instantly create new Upload folder
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Re-name files with unique timestamp
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },    // Limit the upload size upto 2MB
  fileFilter: (req, file, cb) => {  // Blocks the invalid upload instead of(jpeg|jpg|png|gif)
    const validTypes = /jpeg|jpg|png|gif/;
    const ext = validTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = validTypes.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error("Only image files are allowed."));
  },
});

//  MongoDB Database Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/employee_management")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

//  Schema of Employess input form
const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    mobile: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    profileImage: { type: String, required: true },
  },
  { timestamps: true },
);

const Employee = mongoose.model("Employee", employeeSchema);

//   Form validator - No fields are empty before uploading
const validateEmployee = (body) => {
  const { name, email, mobile, department } = body;
  if (!name || !email || !mobile || !department) {
    return "All fields are required.";
  }
  const mobilePattern = /^[0-9]{7,15}$/;
  if (!mobilePattern.test(mobile)) {
    return "Mobile number must contain only digits (7-15 characters).";
  }
  return null;
};

app.get("/api/employees", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Unable to load employees." });
  }
});

app.post("/api/employees", upload.single("profileImage"), async (req, res) => {
  try {
    const validationError = validateEmployee(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Profile image is required." });
    }

    const { name, email, mobile, department } = req.body;
    const employee = new Employee({
      name,
      email,
      mobile,
      department,
      profileImage: `uploads/${req.file.filename}`,
    });
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists." });
    }
    res
      .status(500)
      .json({ message: error.message || "Unable to add employee." });
  }
});

app.put(
  "/api/employees/:id",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const validationError = validateEmployee(req.body);
      if (validationError) {
        return res.status(400).json({ message: validationError });
      }

      const updates = {
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        department: req.body.department,
      };

      const employee = await Employee.findById(req.params.id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found." });
      }

      if (req.file) {
        if (employee.profileImage) {
          const oldImage = path.join(__dirname, employee.profileImage);
          if (fs.existsSync(oldImage)) {
            fs.unlinkSync(oldImage);
          }
        }
        updates.profileImage = `uploads/${req.file.filename}`;
      }

      Object.assign(employee, updates);
      await employee.save();
      res.json(employee);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: "Email already exists." });
      }
      res
        .status(500)
        .json({ message: error.message || "Unable to update employee." });
    }
  },
);

app.delete("/api/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    if (employee.profileImage) {
      const imagePath = path.join(__dirname, employee.profileImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    res.json({ message: "Employee deleted." });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete employee." });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
