// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { RegisterPage} from "./RegisterPage.tsx";

interface LoginPageProps {
    onLoginSuccess: (userId: number) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8081/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }), // <-- send email
            });

            if (response.ok) {
                const data = await response.json();
                const token = data.token;
                const userId = data.userId;
                sessionStorage.setItem("authToken", token);
                sessionStorage.setItem("userId", userId.toString());
                onLoginSuccess(userId); // or real userId if your backend returns it
            } else {
                setError("Invalid email or password");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to login. Try again.");
        }finally { setLoading(false); }
    };


    if (showRegister) {
        return <RegisterPage onRegisterSuccess={() => setShowRegister(false)} />;
    }


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
                    Welcome Back
                </h2>
                <form
                    onSubmit={handleLogin}
                    style={{ display: "flex", flexDirection: "column", gap: "16px" }}
                >
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

                    {/* Error */}
                    {error && (
                        <p style={{ color: "#f15809", textAlign: "center" }}>{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="cta-button"
                        style={{ marginTop: "12px",  color: "black"}}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    <p style={{ color: "#fff", textAlign: "center", fontSize: "14px" }}>
                        Don't have an account?{"  "}
                        <span
                            style={{ color: "#d14a05", cursor: "pointer" }}
                            onClick={() => setShowRegister(true)}
                        >
                            Sing in
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
};

