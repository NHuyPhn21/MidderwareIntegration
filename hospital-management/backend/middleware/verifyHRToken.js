import jwt from "jsonwebtoken";
import axios from "axios";

/**
 * Middleware to verify JWT token from HR System (via Gateway)
 * Used for integrated portal access
 */
const verifyHRToken = async (req, res, next) => {
  try {
    // Get token from Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 1,
        message: "No token provided",
        success: false
      });
    }

    const token = authHeader.substring(7);

    // Try to decode token locally first (using HR system's public key)
    // For now, we'll trust the gateway for verification
    // In production, you should verify with HR system's public key
    
    try {
      // Verify token signature using HR_SECRET or JWT_SECRET
      const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach user info to request
      req.user = {
        id: tokenDecode.id || tokenDecode.sub,
        email: tokenDecode.email,
        firstName: tokenDecode.firstName,
        lastName: tokenDecode.lastName,
        department: tokenDecode.department,
        role: tokenDecode.role || 'EMPLOYEE',
        services: tokenDecode.services || ['hospital']
      };
      
      req.token = token;
      next();
    } catch (jwtError) {
      // If local verification fails, verify with HR system via gateway
      console.log("Local JWT verification failed, attempting to verify with HR system...");
      
      try {
        // Call HR verify endpoint through localhost
        // This ensures token came from legitimate HR system
        const response = await axios.get(
          'http://localhost:8080/api/auth/verify',
          {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 5000
          }
        );

        if (response.data && response.data.user) {
          req.user = {
            id: response.data.user.id,
            email: response.data.user.email,
            firstName: response.data.user.firstName,
            lastName: response.data.user.lastName,
            department: response.data.user.department,
            role: response.data.user.role || 'EMPLOYEE',
            services: response.data.services || ['hospital']
          };
          
          req.token = token;
          next();
        } else {
          return res.status(401).json({
            code: 1,
            message: "Invalid token from HR system",
            success: false
          });
        }
      } catch (error) {
        console.error("HR token verification error:", error.message);
        return res.status(401).json({
          code: 1,
          message: "Token verification failed",
          success: false,
          error: error.message
        });
      }
    }
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({
      code: 5,
      message: "Server error during token verification",
      success: false,
      error: error.message
    });
  }
};

export default verifyHRToken;
