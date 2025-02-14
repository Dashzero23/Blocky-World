/*Nguyen Vu 
npvu@ucsc.edu*/
class Camera{
   constructor(){
      this.eye = new Vector3([0,0,3]);
      this.at  = new Vector3([0,0,-100]);
      this.up  = new Vector3([0,1,0]);
   }
 
   forward(){
      var f = new Vector3([0,0,0]);
      f.set(this.at);
      f.sub(this.eye);
      f = f.normalize();
      this.at = this.at.add(f.mul(0.5));
      this.eye = this.eye.add(f.mul(0.5));
   }

   back(){
      var f = new Vector3([0,0,0]);
      f.set(this.at);
      f.sub(this.eye);
      f = f.normalize();
      this.at = this.at.sub(f.mul(0.5));
      this.eye = this.eye.sub(f.mul(0.5));
   }

   left(){
      var f = new Vector3([0,0,0]);
      f.set(this.eye);
      f.sub(this.at);
      var s = new Vector3([0,0,0]);
      s.set(f);
      s = Vector3.cross(f, this.up);
      s = s.normalize();
      this.at = this.at.add(s.mul(0.25));
      this.eye = this.eye.add(s.mul(0.25));
   }

   right(){
      var f = new Vector3([0,0,0]);
      f.set(this.at);
      f.sub(this.eye);
      var s = new Vector3([0,0,0]);
      s.set(f);
      s = Vector3.cross(f, this.up);
      s = s.normalize();
      this.at = this.at.add(s.mul(0.25));
      this.eye = this.eye.add(s.mul(0.25));
   }

   panLeft(angle) {
      // Convert the angle to radians
      var radians = (angle * Math.PI) / 180;

      // Calculate the forward vector (from eye to at)
      var forward = new Vector3([0, 0, 0]);
      forward.set(this.at);
      forward.sub(this.eye);
      forward = forward.normalize();

      // Calculate the right vector (cross product of forward and up)
      var right = Vector3.cross(forward, this.up);
      right = right.normalize();

      // Create a rotation matrix around the up vector
      var rotationMatrix = new Matrix4();
      rotationMatrix.setRotate(radians, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

      // Rotate the forward vector around the up vector
      var rotatedForward = rotationMatrix.multiplyVector3(forward);

      // Update the at point based on the rotated forward vector
      this.at.set(this.eye);
      this.at.add(rotatedForward);
   }

   panRight(angle) {
      // Convert the angle to radians
      var radians = (angle * Math.PI) / 180;

      // Calculate the forward vector (from eye to at)
      var forward = new Vector3([0, 0, 0]);
      forward.set(this.at);
      forward.sub(this.eye);
      forward = forward.normalize();

      // Calculate the right vector (cross product of forward and up)
      var right = Vector3.cross(forward, this.up);
      right = right.normalize();

      // Create a rotation matrix around the up vector
      var rotationMatrix = new Matrix4();
      rotationMatrix.setRotate(-radians, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

      // Rotate the forward vector around the up vector
      var rotatedForward = rotationMatrix.multiplyVector3(forward);

      // Update the at point based on the rotated forward vector
      this.at.set(this.eye);
      this.at.add(rotatedForward);
   }
}
 