import React, { useState } from "react";

const initialProfile = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  avatar_url: "",
  bio: "",
  location: "",
  timezone: "",
  discord_username: "",
  steam_id: "",
  twitch_username: "",
  preferred_game_modes: [],
  preferred_playtime: [],
  skill_level: "beginner",
  looking_for: "teammates",
  profile_visibility: "public",
  show_stats: true,
  allow_friend_requests: true,
};

const gameModes = ["competitive", "casual", "any"];
const playtimes = ["morning", "afternoon", "evening", "night", "any"];
const skillLevels = ["beginner", "intermediate", "advanced", "expert"];
const lookingFor = [
  "teammates",
  "mentor",
  "casual_friends",
  "competitive_team",
];
const visibilities = ["public", "friends", "private"];

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    ...initialProfile,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name.startsWith("preferred_")) {
      setForm((prev) => {
        const arr = prev[name];
        return {
          ...prev,
          [name]: checked
            ? [...arr, value]
            : arr.filter((v) => v !== value),
        };
      });
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!form.email || !form.username || !form.password) {
      setError("Email, username, and password are required.");
      return;
    }

    // Prepare payload
    const payload = {
      email: form.email,
      username: form.username,
      password: form.password,
      profile: {
        first_name: form.first_name,
        last_name: form.last_name,
        date_of_birth: form.date_of_birth,
        avatar_url: form.avatar_url,
        bio: form.bio,
        location: form.location,
        timezone: form.timezone,
        discord_username: form.discord_username,
        steam_id: form.steam_id,
        twitch_username: form.twitch_username,
        preferred_game_modes: form.preferred_game_modes,
        preferred_playtime: form.preferred_playtime,
        skill_level: form.skill_level,
        looking_for: form.looking_for,
        profile_visibility: form.profile_visibility,
        show_stats: form.show_stats,
        allow_friend_requests: form.allow_friend_requests,
      },
    };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Registration failed.");
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h2>Register</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && (
        <div style={{ color: "green" }}>
          Registration successful! Please check your email to verify your account.
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <h4>Account Info</h4>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="username"
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />

        <h4>Profile Info</h4>
        <input
          name="first_name"
          type="text"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
        />
        <input
          name="last_name"
          type="text"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
        />
        <input
          name="date_of_birth"
          type="date"
          placeholder="Date of Birth"
          value={form.date_of_birth}
          onChange={handleChange}
        />
        <input
          name="avatar_url"
          type="url"
          placeholder="Avatar URL"
          value={form.avatar_url}
          onChange={handleChange}
        />
        <input
          name="bio"
          type="text"
          placeholder="Bio"
          value={form.bio}
          onChange={handleChange}
        />
        <input
          name="location"
          type="text"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
        />
        <input
          name="timezone"
          type="text"
          placeholder="Timezone"
          value={form.timezone}
          onChange={handleChange}
        />
        <input
          name="discord_username"
          type="text"
          placeholder="Discord Username"
          value={form.discord_username}
          onChange={handleChange}
        />
        <input
          name="steam_id"
          type="text"
          placeholder="Steam ID"
          value={form.steam_id}
          onChange={handleChange}
        />
        <input
          name="twitch_username"
          type="text"
          placeholder="Twitch Username"
          value={form.twitch_username}
          onChange={handleChange}
        />

        <div>
          <label>Preferred Game Modes:</label>
          {gameModes.map((mode) => (
            <label key={mode}>
              <input
                type="checkbox"
                name="preferred_game_modes"
                value={mode}
                checked={form.preferred_game_modes.includes(mode)}
                onChange={handleChange}
              />
              {mode}
            </label>
          ))}
        </div>
        <div>
          <label>Preferred Playtime:</label>
          {playtimes.map((pt) => (
            <label key={pt}>
              <input
                type="checkbox"
                name="preferred_playtime"
                value={pt}
                checked={form.preferred_playtime.includes(pt)}
                onChange={handleChange}
              />
              {pt}
            </label>
          ))}
        </div>
        <div>
          <label>Skill Level:</label>
          <select
            name="skill_level"
            value={form.skill_level}
            onChange={handleChange}
          >
            {skillLevels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Looking For:</label>
          <select
            name="looking_for"
            value={form.looking_for}
            onChange={handleChange}
          >
            {lookingFor.map((lf) => (
              <option key={lf} value={lf}>
                {lf}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Profile Visibility:</label>
          <select
            name="profile_visibility"
            value={form.profile_visibility}
            onChange={handleChange}
          >
            {visibilities.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              name="show_stats"
              checked={form.show_stats}
              onChange={handleChange}
            />
            Show Stats
          </label>
          <label>
            <input
              type="checkbox"
              name="allow_friend_requests"
              checked={form.allow_friend_requests}
              onChange={handleChange}
            />
            Allow Friend Requests
          </label>
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}