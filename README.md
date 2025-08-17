# diffy 🔍

A modern, professional text comparison tool built with React and TypeScript. diffy provides a clean, feature-rich interface for comparing text files and code, similar to diffchecker.com but open source and more powerful.

## ✨ Features

- **Real-time Diff Comparison**: Instant line-by-line difference highlighting
- **File Upload Support**: Upload text files directly for comparison
- **Advanced Settings**: Configure diff options like ignore whitespace, case sensitivity
- **Line Selection & Merging**: Select specific lines and merge them between panels
- **Modern UI/UX**: Beautiful gradient design with smooth animations
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Copy & Download**: Export diff results to clipboard or download as file
- **TypeScript**: Full type safety and better development experience
- **Accessibility**: Keyboard navigation and screen reader support

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/diffy.git
cd diffy
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run type-check` - Runs TypeScript type checking

## 🎯 Usage

1. **Text Input**: Enter or paste text in the left (Original) and right (Modified) panels
2. **File Upload**: Click the "Upload File" button to load text files directly
3. **View Differences**: Differences are highlighted in real-time with color coding:
   - 🟢 Green: Added lines
   - 🔴 Red: Removed lines
   - 🟡 Yellow: Selected lines (for merging)
4. **Line Selection**: Click on lines to select them for merging
5. **Merge Lines**: Use the merge buttons to copy selected lines between panels
6. **Settings**: Configure diff options using the settings panel
7. **Export**: Copy diff results to clipboard or download as a file

## 🛠️ Technology Stack

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript development
- **CSS3** - Modern styling with gradients, animations, and responsive design
- **diff** - Powerful diff algorithm for text comparison
- **File API** - Native browser file handling

## 🎨 Design Features

- **Glassmorphism UI**: Modern glass-like interface with backdrop blur effects
- **Gradient Backgrounds**: Beautiful color gradients throughout the interface
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **Professional Typography**: Clean, readable fonts optimized for code display
- **Responsive Grid**: Adaptive layout that works on all screen sizes

## 🔧 Configuration

The application includes several configurable settings:

- **Ignore Whitespace**: Skip differences in spaces, tabs, and line endings
- **Ignore Case**: Treat uppercase and lowercase as the same
- **Show Line Numbers**: Display line numbers in the diff view
- **Word Wrap**: Enable text wrapping in input areas

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [diffchecker.com](https://diffchecker.com)
- Built with modern web technologies and best practices
- Designed for developers, by developers

---

**diffy** - Making text comparison clean and powerful! 🔍✨
