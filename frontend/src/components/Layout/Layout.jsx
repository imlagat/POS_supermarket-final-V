import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
export default function Layout() { return (<div className="flex h-screen"><Sidebar /><main className="flex-1 overflow-auto bg-gray-100 p-6"><div className="max-w-7xl mx-auto"><Outlet /></div></main></div>); }
