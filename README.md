# Husarnet VPN Action for GitHub Actions

Connecting your GitHub workflow to Husarnet peer-to-peer VPN network. Useful for deployment to hosts that don't have a public nor static IP address.

## Usage

```yaml
name: Ping other peer from a VPN network

on: push

jobs:
  build:
    runs-on: ubuntu-20.04
    steps:

    - name: Connecting to Husarnet VPN network
      uses: husarnet/husarnet-action@v2
      with:
        join-code: ${{ secrets.HUSARNET_JOINCODE }}

    - name: Ping other peer
      run: ping6 -c 10 my-laptop

    - name: Stop husarnet
      run: sudo systemctl stop husarnet
```

## Inputs

```yaml
    - name: Husarnet VPN
      uses: husarnet/husarnet-action@v2
      with:
        join-code: ${{ secrets.HUSARNET_JOINCODE }}
        hostname: my-hostname
        cache-key: ${{ env.REPOSITORY_NAME }}-husarnet
```

| input | required | default value | description |
| - | - | - | - |
| `join-code` | yes |  | A Join Code for the Husarnet network you want to connect to. Find your Join Code at https://app.husarnet.com/  |
| `hostname` | no | `github-actions-<repo name>` | A hostname under which this workflow will be available in your Husarnet network. |
| `cache-key` | no | `husarnet-<repo name>` | Thanks to cache, IPv6 address will be the same in the following job runs. Another cache means generating another peer. Useful while using matrix. By default new Husarnet Client for a given repository name is created. You can reuse however the same Husarnet Client ID across multiple repos, by modifying `cache-key` value. In this case remember to have other Husarnet Clients in the same Husarnet network. |

## Outputs

```yaml
    - name: Husarnet VPN
      id: husarnet
      uses: husarnet/husarnet-action@v2
      with:
        join-code: ${{ secrets.HUSARNET_JOINCODE }}
        hostname: my-hostname
        cache-key: husarnet-v
    
    - name: Print IPv6
      run: echo My IPv6 addr is ${{ steps.husarnet.outputs.ipv6 }}
```

| output | description |
| - | - |
| `ipv6` | Husarnet IPv6 address of the peer |
