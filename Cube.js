/*Nguyen Vu 
npvu@ucsc.edu*/
class Cube
{
    constructor()
    {
        this.type = "cube";
        this.color = [1, 1, 1, 1];
        this.matrix = new Matrix4();
        this.textureNum = -2;
    }

    render()
    {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of Cube
        drawTriangle3DUV([0,1,0, 1,1,0, 0,0,0 ], [0,0, 1,0, 1,1]);
        drawTriangle3DUV([0,0,0, 1,0,0, 1,1,0 ], [0,1, 1,1, 0,0]);
        // Back
        drawTriangle3DUV([0,1,1, 1,1,1, 0,0,1 ],[0,0, 1,0, 1,1]);
        drawTriangle3DUV([0,0,1, 1,0,1, 1,1,1 ],[0,1, 1,1, 0,0]);
        // Top
        drawTriangle3D([0,1,0, 1,1,0, 1,1,1 ]);
        drawTriangle3D([0,1,1, 0,1,0, 1,1,1 ]);
        // Bottom
        drawTriangle3D([0,0,0, 0,0,1, 1,0,0 ]);
        drawTriangle3D([1,0,0, 1,0,1, 0,0,1 ]);
        // Left
        drawTriangle3D([0,0,0, 0,1,0, 0,1,1 ],[0,0, 1,0, 1,1]);
        drawTriangle3D([0,1,1, 0,0,0, 0,0,1 ],[0,1, 1,1, 0,0]);
        // Right
        drawTriangle3D([1,0,0, 1,1,0, 1,1,1 ],[0,0, 1,0, 1,1]);
        drawTriangle3D([1,1,1, 1,0,0, 1,0,1 ],[0,1, 1,1, 0,0]);
    }

    renderFast() {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var allverts = [];
        // Front of Cube
        allverts = allverts.concat([0,1,0, 1,1,0, 0,0,0 ]);
        allverts = allverts.concat([0,0,0, 1,0,0, 1,1,0 ]);
        // Back
        allverts = allverts.concat([0,1,1, 1,1,1, 0,0,1 ]);
        allverts = allverts.concat([0,0,1, 1,0,1, 1,1,1 ]);
        // Top
        allverts = allverts.concat([0,1,0, 1,1,0, 1,1,1 ]);
        allverts = allverts.concat([0,1,1, 0,1,0, 1,1,1 ]);
        // Bottom
        allverts = allverts.concat([0,0,0, 0,0,1, 1,0,0 ]);
        allverts = allverts.concat([1,0,0, 1,0,1, 0,0,1 ]);

        // Left
        allverts = allverts.concat([0,0,0, 0,1,0, 0,1,1 ]);
        allverts = allverts.concat([0,1,1, 0,0,0, 0,0,1 ]);
        // Right
        allverts = allverts.concat([1,0,0, 1,1,0, 1,1,1 ]);
        allverts = allverts.concat([1,1,1, 1,0,0, 1,0,1 ]);

        drawTriangle3D(allverts);
     }
}