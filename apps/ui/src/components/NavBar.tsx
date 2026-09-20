import { NavLink } from "react-router-dom";

type NavBarProps = {
  userName: string | undefined;
};
export default function NavBar({ userName }: NavBarProps) {
  function renderLoginLogout() {
    if (userName) {
      return (
        <NavLink className="account-link" to="/logout">
          {userName}
        </NavLink>
      );
    }
    return (
      <NavLink className="account-link" to="/login">
        Login
      </NavLink>
    );
  }

  return (
    <div className="navbar">
      <NavLink className="brand" to="/">
        Space Finder
      </NavLink>
      <NavLink to="/profile">Profile</NavLink>
      <NavLink to="/spaces">Spaces</NavLink>
      <NavLink to="/createSpace">Create space</NavLink>
      {renderLoginLogout()}
    </div>
  );
}
