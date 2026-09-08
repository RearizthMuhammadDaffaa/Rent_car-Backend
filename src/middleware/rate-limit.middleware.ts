import { ratelimit } from "../config/upstash";
import { Request, Response, NextFunction } from "express";

const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // jika ada user ganti my-limit-key jadi userId
    const identifier = req.ip ?? "unknown-ip";
    const {success} = await ratelimit.limit(`login:${identifier}`)

    if(!success) {
      return res.status(429).json({
        message:"Too many request please try again later"
      })
    }
    next()
  } catch (error) {
    next(error);
  }
}

export default rateLimiter;