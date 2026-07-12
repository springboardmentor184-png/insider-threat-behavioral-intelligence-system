function NotFound() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h1>404</h1>
      <h3>Page Not Found</h3>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
}

export default NotFound;