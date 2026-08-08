import Worker from '../models/Worker.js';
import User from '../models/User.js';
import { jsonDb } from '../utils/jsonDb.js';
import bcrypt from 'bcryptjs';

// @desc    Get all workers
// @route   GET /api/workers
// @access  Private/Admin
export const getWorkers = async (req, res) => {
  try {
    let workers = [];
    if (global.dbConnected) {
      workers = await Worker.find({});
    } else {
      workers = jsonDb.find('workers');
    }
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create/Add a worker
// @route   POST /api/workers
// @access  Private/Admin
export const addWorker = async (req, res) => {
  const { name, email, password, phone, role, hourlyRate } = req.body;

  try {
    // 1. Create a user credential first
    let user = null;
    let userId = null;

    if (global.dbConnected) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      user = await User.create({
        name,
        email,
        password,
        role: 'worker',
      });
      userId = user._id;

      // 2. Create the Worker registry
      const worker = await Worker.create({
        userId,
        name,
        email,
        phone: phone || '',
        role: role || 'Staff/Worker',
        hourlyRate: Number(hourlyRate || 15),
        tasks: [],
        attendance: [],
      });

      res.status(201).json(worker);
    } else {
      const userExists = jsonDb.findOne('users', u => u.email === email);
      if (userExists) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = jsonDb.create('users', {
        name,
        email,
        password: hashedPassword,
        role: 'worker',
        phone: phone || '',
        address: { street: '', city: '', state: '', zipCode: '', country: '' }
      });
      userId = user._id;

      const worker = jsonDb.create('workers', {
        userId,
        name,
        email,
        phone: phone || '',
        status: 'active',
        role: role || 'Staff/Worker',
        hourlyRate: Number(hourlyRate || 15),
        tasks: [],
        attendance: [],
      });

      res.status(201).json(worker);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update worker details
// @route   PUT /api/workers/:id
// @access  Private/Admin
export const updateWorker = async (req, res) => {
  const { id } = req.params;
  const { name, phone, role, status, hourlyRate } = req.body;

  try {
    if (global.dbConnected) {
      const worker = await Worker.findById(id);
      if (worker) {
        worker.name = name || worker.name;
        worker.phone = phone !== undefined ? phone : worker.phone;
        worker.role = role || worker.role;
        worker.status = status || worker.status;
        worker.hourlyRate = hourlyRate !== undefined ? Number(hourlyRate) : worker.hourlyRate;

        await worker.save();
        res.json(worker);
      } else {
        res.status(404).json({ message: 'Worker registry not found' });
      }
    } else {
      const worker = jsonDb.findById('workers', id);
      if (worker) {
        const updated = jsonDb.findByIdAndUpdate('workers', id, {
          name: name || worker.name,
          phone: phone !== undefined ? phone : worker.phone,
          role: role || worker.role,
          status: status || worker.status,
          hourlyRate: hourlyRate !== undefined ? Number(hourlyRate) : worker.hourlyRate,
        });
        res.json(updated);
      } else {
        res.status(404).json({ message: 'Worker registry not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign a task to worker
// @route   POST /api/workers/:id/tasks
// @access  Private/Admin
export const assignTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate } = req.body;

  try {
    if (global.dbConnected) {
      const worker = await Worker.findById(id);
      if (worker) {
        worker.tasks.push({
          title,
          description: description || '',
          dueDate: dueDate ? new Date(dueDate) : null,
          status: 'todo',
        });
        await worker.save();
        res.status(201).json(worker);
      } else {
        res.status(404).json({ message: 'Worker not found' });
      }
    } else {
      const worker = jsonDb.findById('workers', id);
      if (worker) {
        const task = {
          _id: Math.random().toString(36).substring(2, 11),
          title,
          description: description || '',
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          status: 'todo',
          assignedDate: new Date().toISOString()
        };
        const updatedTasks = [...(worker.tasks || []), task];
        const updated = jsonDb.findByIdAndUpdate('workers', id, { tasks: updatedTasks });
        res.status(201).json(updated);
      } else {
        res.status(404).json({ message: 'Worker not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task status
// @route   PUT /api/workers/:id/tasks/:taskId
// @access  Private/WorkerOrAdmin
export const updateTaskStatus = async (req, res) => {
  const { id, taskId } = req.params;
  const { status } = req.body; // 'todo', 'in_progress', 'completed'

  try {
    if (global.dbConnected) {
      const worker = await Worker.findById(id);
      if (worker) {
        const task = worker.tasks.id(taskId);
        if (task) {
          task.status = status;
          await worker.save();
          res.json(worker);
        } else {
          res.status(404).json({ message: 'Task not found' });
        }
      } else {
        res.status(404).json({ message: 'Worker not found' });
      }
    } else {
      const worker = jsonDb.findById('workers', id);
      if (worker) {
        const updatedTasks = [...(worker.tasks || [])];
        const idx = updatedTasks.findIndex(t => t._id === taskId);
        if (idx !== -1) {
          updatedTasks[idx].status = status;
          const updated = jsonDb.findByIdAndUpdate('workers', id, { tasks: updatedTasks });
          res.json(updated);
        } else {
          res.status(404).json({ message: 'Task not found' });
        }
      } else {
        res.status(404).json({ message: 'Worker not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Log attendance
// @route   POST /api/workers/:id/attendance
// @access  Private/Admin
export const logAttendance = async (req, res) => {
  const { id } = req.params;
  const { date, status } = req.body; // date format: 'YYYY-MM-DD', status: 'present' | 'absent' | 'leave'

  try {
    if (global.dbConnected) {
      const worker = await Worker.findById(id);
      if (worker) {
        // Check if attendance already logged for date
        const existingIdx = worker.attendance.findIndex(a => a.date === date);
        if (existingIdx !== -1) {
          worker.attendance[existingIdx].status = status;
        } else {
          worker.attendance.push({ date, status });
        }
        await worker.save();
        res.json(worker);
      } else {
        res.status(404).json({ message: 'Worker not found' });
      }
    } else {
      const worker = jsonDb.findById('workers', id);
      if (worker) {
        const updatedAttendance = [...(worker.attendance || [])];
        const existingIdx = updatedAttendance.findIndex(a => a.date === date);
        if (existingIdx !== -1) {
          updatedAttendance[existingIdx].status = status;
        } else {
          updatedAttendance.push({ date, status });
        }
        const updated = jsonDb.findByIdAndUpdate('workers', id, { attendance: updatedAttendance });
        res.json(updated);
      } else {
        res.status(404).json({ message: 'Worker not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
