const Resource = require('../models/Resource');

// @desc    Get PYQs (filterable by subject, chapter, year)
// @route   GET /api/resources/pyqs
const getPYQs = async (req, res) => {
  try {
    const { subject, studentClass } = req.query;

    const filter = { type: 'pyq', paperType: 'full' };

    if (subject) filter.subject = subject;
    if (studentClass) filter.studentClass = studentClass;

    const pyqs = await Resource.find(filter)
      .select('title year subject fileUrl')
      .sort({ year: -1 });

    res.json({ pyqs });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get notes
// @route   GET /api/resources/notes
const getNotes = async (req, res) => {
  try {
    const { subject, chapter, studentClass } = req.query;
    const filter = { type: 'note' };
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    if (studentClass) filter.studentClass = studentClass;

    const notes = await Resource.find(filter).sort({ createdAt: -1 });
    res.json({ notes });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get videos
// @route   GET /api/resources/videos
const getVideos = async (req, res) => {
  try {
    const { subject, chapter, studentClass } = req.query;
    const filter = { type: 'video' };
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    if (studentClass) filter.studentClass = studentClass;

    const videos = await Resource.find(filter).sort({ createdAt: -1 });
    res.json({ videos });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Seed sample resources (for demo)
// @route   POST /api/resources/seed
const seedResources = async (req, res) => {
  try {
    const count = await Resource.countDocuments();
    if (count > 0) {
      return res.json({ message: 'Resources already seeded', count });
    }

    const sampleResources = [
      // PYQs
      {
        title: 'Derive the expression for electric field due to a dipole at axial point',
        subject: 'Physics',
        chapter: 'Electric Charges and Fields',
        type: 'pyq',
        content: 'Derive the expression for the electric field at a point on the axial line of an electric dipole. [5 marks]',
        year: 2023,
        studentClass: '12',
        board: 'CBSE',
      },
      {
        title: 'State and prove Gauss law',
        subject: 'Physics',
        chapter: 'Electric Charges and Fields',
        type: 'pyq',
        content: 'State Gauss theorem in electrostatics. Apply it to find the electric field at a point due to a uniformly charged infinite plane sheet. [5 marks]',
        year: 2022,
        studentClass: '12',
        board: 'CBSE',
      },
      {
        title: 'Explain the mechanism of metallic conduction',
        subject: 'Physics',
        chapter: 'Current Electricity',
        type: 'pyq',
        content: 'Explain the mechanism of metallic conduction. Derive the expression for the resistivity of a conductor. [3 marks]',
        year: 2023,
        studentClass: '12',
        board: 'CBSE',
      },
      {
        title: 'Le Chatelier Principle application',
        subject: 'Chemistry',
        chapter: 'Chemical Kinetics',
        type: 'pyq',
        content: 'State Le Chatelier principle. Apply it to predict the effect of (i) increase in pressure (ii) increase in temperature on the following equilibrium. [3 marks]',
        year: 2023,
        studentClass: '12',
        board: 'CBSE',
      },
      {
        title: 'Integration by parts formula',
        subject: 'Mathematics',
        chapter: 'Integrals',
        type: 'pyq',
        content: 'Evaluate the integral using integration by parts: ∫x²·eˣ dx [4 marks]',
        year: 2023,
        studentClass: '12',
        board: 'CBSE',
      },
      // Notes
      {
        title: 'Electric Charges and Fields — Complete Notes',
        subject: 'Physics',
        chapter: 'Electric Charges and Fields',
        type: 'note',
        content: 'Comprehensive notes covering: Coulomb law, Electric field, Dipole, Gauss theorem, and applications. Includes all important formulas and derivations for board exam.',
        studentClass: '12',
        board: 'CBSE',
      },
      {
        title: 'Electrochemistry — Quick Revision',
        subject: 'Chemistry',
        chapter: 'Electrochemistry',
        type: 'note',
        content: 'Quick revision notes: Nernst equation, Kohlrausch law, Faraday laws of electrolysis, EMF of a cell, Conductance and conductivity.',
        studentClass: '12',
        board: 'CBSE',
      },
      {
        title: 'Matrices and Determinants — Formula Sheet',
        subject: 'Mathematics',
        chapter: 'Matrices',
        type: 'note',
        content: 'All formulas: Types of matrices, Matrix operations, Adjoint, Inverse, Properties of determinants, Cramer rule.',
        studentClass: '12',
        board: 'CBSE',
      },
      // Videos
      {
        title: 'Current Electricity — Full Chapter',
        subject: 'Physics',
        chapter: 'Current Electricity',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=example1',
        studentClass: '12',
        board: 'CBSE',
      },
      {
        title: 'Organic Chemistry Reactions — One Shot',
        subject: 'Chemistry',
        chapter: 'Haloalkanes and Haloarenes',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=example2',
        studentClass: '12',
        board: 'CBSE',
      },
      {
        title: 'Probability — Board Exam Prep',
        subject: 'Mathematics',
        chapter: 'Probability',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=example3',
        studentClass: '12',
        board: 'CBSE',
      },
    ];

    await Resource.insertMany(sampleResources);
    res.status(201).json({ message: 'Sample resources seeded', count: sampleResources.length });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Error seeding resources' });
  }
};

module.exports = { getPYQs, getNotes, getVideos, seedResources };
