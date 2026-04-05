// backend/data/badges.js
// Single source of truth for all badge definitions

const BADGES = [
    {
        id: 'first_doubt',
        name: 'Curious Starter',
        description: 'Asked your first doubt',
        icon: '🤔',
        color: '#6366f1',
    },
    {
        id: 'curious_mind',
        name: 'Curious Mind',
        description: 'Asked 5 doubts',
        icon: '🧠',
        color: '#8b5cf6',
    },
    {
        id: 'first_quiz',
        name: 'Quiz Taker',
        description: 'Completed your first quiz',
        icon: '🎯',
        color: '#10b981',
    },
    {
        id: 'perfect_score',
        name: 'Perfect Score',
        description: 'Got full marks in a graded answer',
        icon: '🏆',
        color: '#f59e0b',
    },
    {
        id: 'note_reader',
        name: 'Note Taker',
        description: 'Read your first AI-generated notes',
        icon: '📘',
        color: '#3b82f6',
    },
    {
        id: 'summary_master',
        name: 'Summary Master',
        description: 'Generated 3 chapter summaries',
        icon: '📝',
        color: '#ec4899',
    },
    {
        id: 'flashcard_fan',
        name: 'Flashcard Fan',
        description: 'Studied your first flashcard set',
        icon: '🗂️',
        color: '#f97316',
    },
    {
        id: 'pyq_explorer',
        name: 'PYQ Explorer',
        description: 'Explored previous year questions',
        icon: '📋',
        color: '#14b8a6',
    },
    {
        id: 'voice_user',
        name: 'Voice Scholar',
        description: 'Used voice mode to ask a doubt',
        icon: '🎙️',
        color: '#a855f7',
    },
    {
        id: 'all_subjects',
        name: 'All-Rounder',
        description: 'Asked doubts in 5 different subjects',
        icon: '🌟',
        color: '#eab308',
    },
];

module.exports = BADGES;
