// Inisialisasi container utama
const container = document.querySelector(".container");

// Memantau perubahan status autentikasi
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    Dashboard(user);
  } else {
    Landing();
  }
});

// Fungsi untuk halaman login/register
const Landing = () => {
  const element = document.createElement("div");
  element.classList.add("Landing");
  element.innerHTML = `
        <div class="auth-container">
            <div class="auth-tabs">
                <button class="tab-btn active" data-tab="login">Login</button>
                <button class="tab-btn" data-tab="register">Register</button>
                <button class="tab-btn" data-tab="forgot">Lupa Password</button>
            </div>
            
            <div class="tab-content active" id="login-tab">
                <div class="inputan">
                    <label for="email-login">Email</label>
                    <input type="email" id="email-login" placeholder="email@contoh.com" required>
                    
                    <label for="password-login">Password</label>
                    <input type="password" id="password-login" placeholder="Password Anda" required>
                    
                    <button class="auth-btn" data-action="login-email">Login</button>
                </div>
                
                <div class="divider">
                    <span>ATAU</span>
                </div>
                
                <button class="google-btn" data-action="login-google">
                    <svg class="google-icon" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Login dengan Google
                </button>
            </div>
            
            <div class="tab-content" id="register-tab">
                <div class="inputan">
                    <label for="email-register">Email</label>
                    <input type="email" id="email-register" placeholder="email@contoh.com" required>
                    
                    <label for="password-register">Password</label>
                    <input type="password" id="password-register" placeholder="Minimal 6 karakter" required>
                    
                    <label for="password-confirm">Konfirmasi Password</label>
                    <input type="password" id="password-confirm" placeholder="Ulangi password" required>
                    
                    <button class="auth-btn" data-action="register">Daftar</button>
                </div>
            </div>
            
            <div class="tab-content" id="forgot-tab">
                <div class="inputan">
                    <p class="info-text">Masukkan email Anda untuk reset password</p>
                    
                    <label for="email-forgot">Email</label>
                    <input type="email" id="email-forgot" placeholder="email@contoh.com" required>
                    
                    <button class="auth-btn" data-action="forgot">Kirim Link Reset</button>
                </div>
            </div>
        </div>
    `;

  container.innerHTML = "";
  container.appendChild(element);

  // Fungsi untuk berpindah tab
  const tabBtns = element.querySelectorAll(".tab-btn");
  const tabContents = element.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");

      // Hapus active class dari semua tab
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      // Tambah active class ke tab yang dipilih
      btn.classList.add("active");
      document.getElementById(`${tabId}-tab`).classList.add("active");
    });
  });

  // Event listener untuk semua tombol aksi
  element.addEventListener("click", (e) => {
    const action = e.target.getAttribute("data-action");

    if (!action) return;

    switch (action) {
      case "login-email":
        handleEmailLogin();
        break;
      case "register":
        handleRegister();
        break;
      case "login-google":
        handleGoogleLogin();
        break;
      case "forgot":
        handleForgotPassword();
        break;
    }
  });

  // Fungsi untuk login dengan email/password
  const handleEmailLogin = () => {
    const email = document.getElementById("email-login").value;
    const password = document.getElementById("password-login").value;

    if (!email || !password) {
      showAlert("Harap isi semua field", "error");
      return;
    }

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((cred) => {
        showAlert(`Selamat datang ${cred.user.email}`, "success");
      })
      .catch((error) => {
        handleAuthError(error);
      });
  };

  // Fungsi untuk mendaftar akun baru
  const handleRegister = () => {
    const email = document.getElementById("email-register").value;
    const password = document.getElementById("password-register").value;
    const confirmPassword = document.getElementById("password-confirm").value;

    if (!email || !password || !confirmPassword) {
      showAlert("Harap isi semua field", "error");
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Password tidak cocok", "error");
      return;
    }

    if (password.length < 6) {
      showAlert("Password minimal 6 karakter", "error");
      return;
    }

    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((cred) => {
        showAlert(`Akun ${cred.user.email} berhasil dibuat`, "success");

        // Opsional: Tambahkan data pengguna ke Firestore
        return firebase.firestore().collection("users").doc(cred.user.uid).set({
          email: cred.user.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        });
      })
      .then(() => {
        console.log("Data pengguna disimpan di Firestore");
      })
      .catch((error) => {
        handleAuthError(error);
      });
  };

  // Fungsi untuk login dengan Google
  const handleGoogleLogin = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");

    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        showAlert(
          `Berhasil login dengan Google: ${user.displayName}`,
          "success"
        );

        // Simpan data pengguna ke Firestore jika baru pertama kali login
        return firebase.firestore().collection("users").doc(user.uid).set(
          {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            provider: "google",
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      })
      .then(() => {
        console.log("Data pengguna Google disimpan");
      })
      .catch((error) => {
        handleAuthError(error);
      });
  };

  // Fungsi untuk reset password
  const handleForgotPassword = () => {
    const email = document.getElementById("email-forgot").value;

    if (!email) {
      showAlert("Harap masukkan email", "error");
      return;
    }

    firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        showAlert("Link reset password telah dikirim ke email Anda", "success");
        // Kembali ke tab login
        tabBtns[0].click();
      })
      .catch((error) => {
        handleAuthError(error);
      });
  };
};

// Fungsi untuk dashboard setelah login
const Dashboard = (user) => {
  let displayName = user.displayName || user.email.split("@")[0];
  let photoURL =
    user.photoURL ||
    "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(displayName) +
      "&background=random";
  let email = user.email;
  let uid = user.uid;

  // Update last login di Firestore
  firebase
    .firestore()
    .collection("users")
    .doc(uid)
    .update({
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .catch(() => {
      // Jika dokumen belum ada, buat baru
      firebase.firestore().collection("users").doc(uid).set(
        {
          uid: uid,
          email: email,
          displayName: displayName,
          photoURL: photoURL,
          lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    });

  const element = document.createElement("div");
  element.classList.add("Dashboard");
  element.innerHTML = `
        <div class="profile-card">
            <div class="profile-header">
                <div class="foto-user" style="background-image: url('${photoURL}')"></div>
                <div class="profile-info">
                    <h2 class="nama-user">${displayName}</h2>
                    <p class="email-user">${email}</p>
                    <p class="uid-info">UID: <span class="uid-code">${uid}</span></p>
                </div>
            </div>
            
            <div class="user-stats">
                <div class="stat-item">
                    <span class="stat-label">Provider</span>
                    <span class="stat-value">${
                      user.providerData[0].providerId
                    }</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Email Verified</span>
                    <span class="stat-value ${
                      user.emailVerified ? "verified" : "not-verified"
                    }">
                        ${user.emailVerified ? "✓" : "✗"}
                    </span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Terdaftar</span>
                    <span class="stat-value">${new Date(
                      user.metadata.creationTime
                    ).toLocaleDateString("id-ID")}</span>
                </div>
            </div>
            
            <div class="dashboard-actions">
                <button class="action-btn" data-action="refresh">
                    <span class="btn-icon">🔄</span> Refresh
                </button>
                <button class="action-btn" data-action="update-profile">
                    <span class="btn-icon">✏️</span> Edit Profil
                </button>
                <button class="action-btn logout-btn" data-action="logout">
                    <span class="btn-icon">🚪</span> Logout
                </button>
            </div>
            
            <div class="auth-info">
                <p>Token: <span class="token-preview">${user.uid.substring(
                  0,
                  20
                )}...</span></p>
                <button class="copy-btn" data-copy="${
                  user.uid
                }">Salin UID</button>
            </div>
        </div>
    `;

  container.innerHTML = "";
  container.appendChild(element);

  // Event listener untuk tombol aksi di dashboard
  element.addEventListener("click", (e) => {
    const action = e.target
      .closest("[data-action]")
      ?.getAttribute("data-action");
    const copyData = e.target.closest("[data-copy]")?.getAttribute("data-copy");

    if (action === "logout") {
      firebase
        .auth()
        .signOut()
        .then(() => showAlert("Berhasil logout", "success"))
        .catch((err) => showAlert(err.message, "error"));
    } else if (action === "refresh") {
      user.getIdToken(true).then(() => {
        showAlert("Token diperbarui", "success");
      });
    } else if (action === "update-profile") {
      showAlert("Fitur edit profil akan segera tersedia", "info");
    }

    if (copyData) {
      navigator.clipboard
        .writeText(copyData)
        .then(() => showAlert("UID disalin ke clipboard", "success"))
        .catch(() => showAlert("Gagal menyalin UID", "error"));
    }
  });
};

// Fungsi untuk menampilkan alert/notifikasi
const showAlert = (message, type = "info") => {
  // Hapus alert sebelumnya jika ada
  const existingAlert = document.querySelector(".custom-alert");
  if (existingAlert) existingAlert.remove();

  const alert = document.createElement("div");
  alert.className = `custom-alert ${type}`;
  alert.innerHTML = `
        <span class="alert-message">${message}</span>
        <button class="alert-close">&times;</button>
    `;

  document.body.appendChild(alert);

  // Animasi masuk
  setTimeout(() => alert.classList.add("show"), 10);

  // Auto hide setelah 5 detik
  const autoHide = setTimeout(() => {
    alert.classList.remove("show");
    setTimeout(() => alert.remove(), 300);
  }, 5000);

  // Tombol close
  alert.querySelector(".alert-close").addEventListener("click", () => {
    clearTimeout(autoHide);
    alert.classList.remove("show");
    setTimeout(() => alert.remove(), 300);
  });
};

// Fungsi untuk menangani error autentikasi
const handleAuthError = (error) => {
  let message = "Terjadi kesalahan";

  switch (error.code) {
    case "auth/invalid-email":
      message = "Format email tidak valid";
      break;
    case "auth/user-disabled":
      message = "Akun ini dinonaktifkan";
      break;
    case "auth/user-not-found":
      message = "Akun tidak ditemukan";
      break;
    case "auth/wrong-password":
      message = "Password salah";
      break;
    case "auth/email-already-in-use":
      message = "Email sudah terdaftar";
      break;
    case "auth/weak-password":
      message = "Password terlalu lemah (minimal 6 karakter)";
      break;
    case "auth/operation-not-allowed":
      message = "Metode login tidak diizinkan";
      break;
    case "auth/network-request-failed":
      message = "Gagal terhubung ke jaringan";
      break;
    case "auth/popup-closed-by-user":
      message = "Popup login ditutup oleh pengguna";
      break;
    default:
      message = error.message;
  }

  showAlert(message, "error");
};
