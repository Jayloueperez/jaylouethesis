"use client";

import { useState } from "react";

import { createUser } from "~/lib/firebase/client/firestore";

function CreateAdminPage() {
  const [id, setId] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  async function handleCreateAdmin() {
    await createUser(id, {
      email,
      address: "",
      age: "",
      contact: "",
      course: "",
      firstName: "",
      gender: "",
      keywords: [],
      middleInitial: "",
      profile: "",
      provider: "email-password",
      role: "admin",
      section: "",
      status: "confirmed",
      surname: "",
      tokens: [],
      year: "",
      attachments: [],
      birthdate: "",
      talentsAssigned: [],
    });
  }

  return (
    <div>
      <button onClick={handleCreateAdmin}>Create</button>

      <input value={id} onChange={(e) => setId(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
    </div>
  );
}

export default CreateAdminPage;
