import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Checkbox, message } from "antd";
//import KakaoApi from "../../action/KakaoApi.js"; // KakaoApi
import moment from "moment";
import axios from "axios";
import Cookie from "js-cookie";
import { localurl } from "../utils/localUrl";
import "../Style/Login.css";
import KakaoApi from "../action/KakaoApi";

//로그인 화면(완료)
function LoginPage() {
  // useState를 사용하여 ID와 비밀번호를 상태로 관리합니다.
  const [idValue, setId] = useState("");
  const [pwValue, setPw] = useState("");
  const navigate = useNavigate();

  const username = /^[A-Za-z0-9_-]{5,20}$/;
  const userpassword =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,16}$/;

  const saveUserId = (e) => {
    setId(e.target.value);
  };
  const saveUserPw = (e) => {
    setPw(e.target.value);
  };

  const doLogin = () => {
    // console.log("Login!!");

    fetch(`${localurl}/generateToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mid: idValue,
        mpw: pwValue,
      }),
    })
      .then((response) => {
        // 응답 본문을 텍스트로 읽음
        return response.text();
      })
      .then((textData) => {
        //console.log(textData);
        // 텍스트 데이터를 JSON으로 변환
        const jsonData = JSON.parse(textData);
        // 토큰 정보 콘솔 출력
        //console.log("Parsed LoginPage JSON data:", jsonData);
        // 로컬 스토리지에 저장
        localStorage.setItem("accessToken", jsonData.accessToken);
        localStorage.setItem("refreshToken", jsonData.refreshToken);
        // 로그인시 새로고침(삭제 예정)
        navigate("/");
      })
      .catch((error) => {
        // 페이지 이동 또는 다른 작업 수행
        console.error("로그인 에러:", error);
        message.error(
          `로그인 중 오류가 발생했습니다. 자세한 정보: ${error.message}`
        );
      });
  };

  // 임시 로그아웃(발행한 토큰을 삭제하는 기능으로)
  // 로그아웃시 메인 홈페이지로 돌아가게끔 구현해야된다
  const doTempLogout = () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // 로그아웃시 새로고침
      navigate("/");
    } catch (error) {
      // 페이지 이동 또는 다른 작업 수행
      console.error("로그인 에러:", error);
      message.error(
        `로그인 중 오류가 발생했습니다. 자세한 정보: ${error.message}`
      );
    }
  };

  const onFinish = async (values) => {
    const { userid, password } = values;
    if (typeof userid !== "string" || typeof password !== "string") {
      console.log("아이디와 비밀번호를 입력하세요.");
      return;
    }
    try {
      // 서버에 로그인 요청을 보냅니다.
      const response = await axios.post(`${localurl}/Login`, {
        userid: values.userid,
        password: values.password,
      });
      const { accessToken, refreshToken } = response.data;
      // Access Token 저장
      Cookie.set("accessToken", accessToken);
      // Refresh Token 저장
      Cookie.set("refreshToken", refreshToken);

      // Access Token 만료 시간 설정 (15분)
      const expiresAt = moment().add(15, "minutes").toDate();
      Cookie.set("expiresAt", expiresAt);

      //메인으로 이동(관리자시에는?(수정해야함))
      navigate("/");
      return true; // 로그인 성공
    } catch (error) {
      // 페이지 이동 또는 다른 작업 수행
      console.error("로그인 에러:", error);
      message.error(
        `로그인 중 오류가 발생했습니다. 자세한 정보: ${error.message}`
      );
      return false; // 로그인 실패
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  // const handleLogout = useCallback(() => {
  //   // 토큰 및 인증 상태 제거
  //   try {
  //     localStorage.removeItem("accessToken");
  //     localStorage.removeItem("refreshToken");
  //     localStorage.removeItem("expiresAt");
  //     // 로그아웃시 새로고침
  //     window.location.reload();
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }, []);

  return (
    <div className="login-form-container">
      <h1 className="login-form-header">
        <Link to="/">
          <img src="/img/icons/fooiting.png" alt="" />
        </Link>
      </h1>
      <Form
        name="loginForm"
        initialValues={{
          remember: false,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        className="login-form"
      >
        {/* 아이디 창 */}
        <Form.Item
          label=""
          name="userid"
          rules={[
            {
              required: true,
              message: "아이디를 입력하세요!",
            },
            { pattern: username, message: "아이디 형식을 확인해주세요." }, // 패턴 검사 추가
          ]}
        >
          {/*input 안 내용물*/}
          <Input
            value={idValue}
            onChange={saveUserId}
            size="large"
            placeholder="아이디"
          />
        </Form.Item>
        <Form.Item
          label=""
          name="password"
          rules={[
            {
              required: true,
              message: "비밀번호를 입력하세요!",
            },
            { pattern: userpassword, message: "비밀번호 형식을 확인해주세요." }, // 패턴 검사 추가
          ]}
        >
          {/*input 안 내용물*/}
          <Input.Password
            value={pwValue}
            onChange={saveUserPw}
            size="large"
            placeholder="비밀번호"
          />
        </Form.Item>

        {/*로그인버튼*/}

        <div>
          <div>
            <Button
              className="login-form-button"
              onClick={doLogin}
              htmlType="submit"
            >
              로그인
            </Button>
          </div>
          <div>
            <button onClick={doTempLogout}>로그아웃</button>
          </div>
          <Checkbox className="checkbox">로그인 상태 유지</Checkbox>
        </div>

        <hr />
        <Button
          className="login-form-button"
          type="submit"
          onClick={() => navigate("../Signup")}
        >
          회원가입
        </Button>
        <div className="login-links">
          <Link className="login-links" to={"/"}>
            아이디 찾기
          </Link>{" "}
          |{" "}
          <Link className="login-links" to={"/"}>
            비밀번호 찾기
          </Link>{" "}
          |{" "}
          <Link className="login-links" to={"/SignUpPage"}>
            회원가입
          </Link>
        </div>
        {/* 로그인 페이지 내의 다른 컴포넌트들 */}
        {/* KakaoApi 컴포넌트를 여기서 사용 */}
        <KakaoApi />
      </Form>
    </div>
  );
}

export default LoginPage;
