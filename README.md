# TiKV Browser

## Usage

_1_. Pull docker image and run container:

```
docker pull bsdelf/tikv-browser
docker run --name tikv-browser -p 3000:3000 bsdelf/tikv-browser:latest
```

_2_. Open [http://localhost:3000](http://localhost:3000) in your browser.

_3_. Click the plus button on the sider to create a new profile.

_4_. Hover on the newly created profile, click the primary button.

_5_. Enjoy.

## Limitations

- Raw key-value API is not implemented, therefore you can only search transactional key-values for now.
- Update profiles won't affect existing connection tabs.

## Known issues

- If the endpoints are invalid or unreachable, the connection will stuck for a while. So if you want to recover immediately, just restart the docker container and refresh the browser.

## Screenshots

![search result](https://i.imgur.com/jUuqqyD.png)
