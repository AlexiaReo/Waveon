import { useState } from "react";

interface RegisterPageProps {
    onRegisterSuccess: () => void; // callback to go back to login
}

export const RegisterPage = ({ onRegisterSuccess }: RegisterPageProps) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"USER" | "ARTIST">("USER");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("http://localhost:8081/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password, role }),
            });

            if (response.ok) {
                onRegisterSuccess(); // go back to login
            } else {
                setError("Registration failed. Check your input.");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to register. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="music-platform-wrapper"
            style={{ justifyContent: "center", alignItems: "center" }}
        >
            <div
                className="hero"
                style={{
                    maxWidth: "400px",
                    width: "100%",
                    padding: "48px",
                    borderRadius: "16px",
                }}
            >
                <h2
                    style={{
                        marginBottom: "24px",
                        color: "#fff",
                        textAlign: "center",
                    }}
                >
                    Create Account
                </h2>
                <form
                    onSubmit={handleRegister}
                    style={{ display: "flex", flexDirection: "column", gap: "16px" }}
                >
                    {/* Username */}
                    <div>
                        <label style={{ color: "#fff", fontWeight: 500 }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "12px",
                                borderRadius: "8px",
                                border: "none",
                                outline: "none",
                                marginTop: "4px",
                                background: "rgba(255, 255, 255, 0.05)",
                                color: "#fff",
                            }}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label style={{ color: "#fff", fontWeight: 500 }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "12px",
                                borderRadius: "8px",
                                border: "none",
                                outline: "none",
                                marginTop: "4px",
                                background: "rgba(255, 255, 255, 0.05)",
                                color: "#fff",
                            }}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label style={{ color: "#fff", fontWeight: 500 }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "12px",
                                borderRadius: "8px",
                                border: "none",
                                outline: "none",
                                marginTop: "4px",
                                background: "rgba(255, 255, 255, 0.05)",
                                color: "#fff",
                            }}
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label style={{ color: "#fff", fontWeight: 500 }}>Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as "USER" | "ARTIST")}
                            style={{
                                width: "100%",
                                padding: "12px",
                                borderRadius: "8px",
                                border: "none",
                                outline: "none",
                                marginTop: "4px",
                                background: "rgba(255, 255, 255, 0.05)",
                                color: "#fff",
                                appearance: "none",
                                cursor: "pointer",
                            }}
                        >
                            <option value="USER">User</option>
                            <option value="ARTIST">Artist</option>
                        </select>
                    </div>

                    {error && (
                        <p style={{ color: "#f15809", textAlign: "center" }}>{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="cta-button"
                        style={{ marginTop: "12px", color: "black" }}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>

                    <p style={{ color: "#fff", textAlign: "center", fontSize: "14px" }}>
                        Already have an account?{" "}
                        <span
                            style={{ color: "#f15809", cursor: "pointer" }}
                            onClick={onRegisterSuccess}
                        >
              Login
            </span>
                    </p>
                </form>
            </div>
        </div>
    );
};

