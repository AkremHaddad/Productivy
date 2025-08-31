export const dummyBoard = {
  id: 'board-1',
  title: 'Board 1',
  columns: [
    {
      id: 'col-1',
      title: 'To Do',
      color: { fill: '#ff6b6b', border: '#e63946' }, // Red (custom placeholder, adjust to your palette)
      cards: [
        { id: 'card-1', text: 'Finish the Figma design' },
        { id: 'card-2', text: 'Start coding' },
      ],
    },
    {
      id: 'col-2',
      title: 'Doing',
      color: { fill: '#4dabf7', border: '#3a86ff' }, // Blue (custom placeholder, adjust to your palette)
      cards: [
        { id: 'card-3', text: 'Creating the Figma' },
        { id: 'card-4', text: 'Test' },
        { id: 'card-5', text: 'Test' },
      ],
    },
    {
      id: 'col-3',
      title: 'Done',
      color: { fill: '#51cf66', border: '#2f9e44' }, // Green (custom placeholder, adjust to your palette)
      cards: [
        { id: 'card-6', text: 'Test' },
      ],
    },
    {
      id: 'col-4',
      title: 'Backlog',
      color: { fill: '#ffd43b', border: '#fcc419' }, // Yellow (custom placeholder, adjust to your palette)
      cards: [],
    },
    {
      id: 'col-5',
      title: 'Review',
      color: { fill: '#cc5de8', border: '#be4bdb' }, // Purple (custom placeholder, adjust to your palette)
      cards: [
        { id: 'card-7', text: 'Peer review code' },
      ],
    },
    {
      id: 'col-6',
      title: 'Blocked',
      color: { fill: '#ffa94d', border: '#fd7e14' }, // Orange (custom placeholder, adjust to your palette)
      cards: [
        { id: 'card-8', text: 'Waiting on API keys' },
        { id: 'card-9', text: 'Dependency issue' },
      ],
    },
    {
      id: 'col-7',
      title: 'Testing',
      color: { fill: '#66d9e8', border: '#22b8cf' }, // Teal (custom placeholder, adjust to your palette)
      cards: [
        { id: 'card-10', text: 'Run unit tests' },
      ],
    },
    {
      id: 'col-8',
      title: 'Deploy',
      color: { fill: '#f783ac', border: '#e64980' }, // Pink (custom placeholder, adjust to your palette)
      cards: [],
    },
  ],
};