const container = document.querySelector(".container");

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    Dashboard(user);
  } else {
    Landing();
  }
});

const Landing = () => {
  const element = document.createElement("div");
  element.classList.add("Landing");
  element.innerHTML = `
        <div class="inputan">
            <label for="email">Email</label>
            <input type="text" name="email" id="email" placeholder="Tulis Email">
            <label for="password">Password</label>
            <input type="password" name="password" id="password" placeholder="Tulis Password">
        </div>
        <div class="tombolan">
            <button data-button="regiter">Register</button>
            <button data-button="login">Login</button>
            <button data-button="forgot">Forgot</button>
        </div>
    `;

  container.innerHTML = "";
  container.appendChild(element);

  const email = element.querySelector("#email");
  const password = element.querySelector("#password");

  let actionCodeSettings = {
    url: window.location.origin,
    handleCodeInApp: true,
  };

  start.onclick = () => {
    firebase
      .auth()
      .sendSignInLinkToEmail(email.value, actionCodeSettings)
      .then(() => {
        window.localStorage.setItem("emailForSignIn", email.value);
        alert("Silahkan Periksa Email Kami Untuk Login");
      })
      .catch((error) => {
        alert(error);
      });
  };

  const regiterBtn = element.querySelector(`[data-button="regiter"]`);
  const loginBtn = element.querySelector(`[data-button="login"]`);
  const forgotBtn = element.querySelector(`[data-button="forgot"]`);

  regiterBtn.onclick = () => {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email.value, password.value)
      .then((cred) => {
        alert(`Berhasil Membuat Akun ${cred.user.uid}`);
      })
      .catch((error) => {
        alert(error);
      });
  };

  loginBtn.onclick = () => {
    firebase
      .auth()
      .signInWithEmailAndPassword(email.value, password.value)
      .then((cred) => {
        alert(`Selamat Datang Akun: ${cred.user.uid}`);
      })
      .catch((error) => {
        alert(error);
      });
  };

  forgotBtn.onclick = () => {
    firebase
      .auth()
      .sendPasswordResetEmail(email.value)
      .then(() => {
        alert(`Berhasil Mengirim Password Reset ke ${email.value}`);
      })
      .catch((error) => {
        alert(error);
      });
  };
};

const Dashboard = (user) => {
  const element = document.createElement("div");
  element.classList.add("Dashboard");
  element.innerHTML = `
        <div>Email: ${user.email}</div>
        <div>UID: ${user.uid}</div>
        <button data-button="logout">Logout</button>
    `;

  container.innerHTML = "";
  container.appendChild(element);

  const logout = element.querySelector(`[data-button="logout"]`);
  logout.onclick = () =>
    firebase
      .auth()
      .signOut()
      .then(() => {
        alert("Berhasil Logout");
      })
      .catch((err) => alert(err));
};
