import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <h2>Tjay's Blog</h2>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/news">News</Link></li>
      </ul>
    </nav>
  )
}

