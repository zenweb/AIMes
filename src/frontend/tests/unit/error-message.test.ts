import { describe, expect, it } from 'vitest'
import { errorMessage } from '../../src/utils/error-message'

describe('errorMessage', () => {
  it('prefers API response message so users see the server validation reason', () => {
    const error = {
      response: {
        data: {
          message: '用户名或密码错误',
        },
      },
      message: 'Request failed with status code 400',
    }

    expect(errorMessage(error, '登录失败')).toBe('用户名或密码错误')
  })

  it('can read response title when problem details use title instead of message', () => {
    const error = {
      response: {
        data: {
          title: '库存不足',
        },
      },
      message: 'Request failed with status code 409',
    }

    expect(errorMessage(error, '操作失败', 'title')).toBe('库存不足')
  })

  it('falls back when response and error messages are empty or non-string values', () => {
    expect(errorMessage({ response: { data: { message: '   ' } }, message: 404 }, '操作失败')).toBe('操作失败')
    expect(errorMessage(null, '操作失败')).toBe('操作失败')
  })
})
