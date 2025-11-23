import User from "../schema/user.js";

// login user
export async function login(req, res) {
  try {
    const { login_name, password } = req.body;

    if (!login_name || !password) {
      return res.status(400).send({ error: "Both login_name and password required" });
    }

    const user = await User.findOne({ login_name }).lean().exec();
    if (!user || user.password !== password) {
      return res.status(400).send({ error: "Invalid login_name or password" });
    }

    req.session.userId = user._id.toString();
    req.session.login_name = user.login_name;

    return res.status(200).send({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      login_name: user.login_name,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).send({ error: "Internal server error" });
  }
}

// logout user
export async function logout(req, res) {
  if (!req.session?.userId) {
    return res.status(400).send({ error: "Not logged in" });
  }
  return req.session.destroy((err) => {
    console.error('Error destroying session:', err);
    if (err) return res.status(500).send({ error: "Internal server error" });
    return res.status(200).send({ message: "Logged out successfully" });
  });
}

// get current logged-in user
export async function currentUser(req, res) {
  try {
    const user = await User.findById(req.session.userId)
      .select("_id first_name last_name login_name")
      .lean()
      .exec();

    if (!user) return res.status(400).send({ error: "User not found" });

    return res.status(200).send(user);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: "Internal server error" });
  }
}
