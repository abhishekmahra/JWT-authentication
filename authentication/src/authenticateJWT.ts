import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET || 'hihihihihi', (err: any, user: any) => {
      if (err) {
        return res.sendStatus(403);
      }
      res.locals.user = user; //object that hold response local variables, its scope is limited to requrest 
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

export default authenticateJWT; 
