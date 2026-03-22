import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/home";
import AuthorPage from "./pages/author";
import AuthorsPage from "./pages/authorsPage";
import BooksPage from "./pages/booksPage";
import BookPage from "./pages/book";
import PreferencesPage from "./pages/preferencesPage";
import ProfilePage from "./pages/profilePage";
import UserProfilePage from "./pages/userProfilePage";
import SearchPage from "./pages/searchPage";
import PrivateRoute from "./components/privateRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/preferences"
        element={
          <PrivateRoute>
            <PreferencesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/usuarios/:id"
        element={
          <PrivateRoute>
            <UserProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/autores"
        element={
          <PrivateRoute>
            <AuthorsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/autores/:id"
        element={
          <PrivateRoute>
            <AuthorPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/livros"
        element={
          <PrivateRoute>
            <BooksPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/livros/:id"
        element={
          <PrivateRoute>
            <BookPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/pesquisa"
        element={
          <PrivateRoute>
            <SearchPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
