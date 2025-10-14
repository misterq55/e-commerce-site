// 폼 유효성 검증 규칙

export const userEmail = {
  required: '이메일은 필수입니다',
  pattern: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: '올바른 이메일 형식이 아닙니다'
  }
}

export const userName = {
  required: '이름은 필수입니다',
  minLength: {
    value: 2,
    message: '이름은 2자 이상이어야 합니다'
  }
}

export const userPassword = {
  required: '비밀번호는 필수입니다',
  minLength: {
    value: 6,
    message: '비밀번호는 6자 이상이어야 합니다'
  }
}

// 비밀번호 확인 (비교할 비밀번호 값을 받아야 함)
export const userConfirmedPassword = (passwordValue: string) => ({
  required: '비밀번호 확인은 필수입니다',
  validate: (value: string) => value === passwordValue || '비밀번호가 일치하지 않습니다'
})
